import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import { db, saveUserAddresses, transferARG } from '../services/firebase';
import { useTokenPrices } from '../services/TokenPriceService';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import {
    ArrowUpRight, ArrowDownLeft, Copy, Check, Loader2,
    AlertCircle, X, ChevronDown, CreditCard, Repeat,
    History, ExternalLink, RefreshCw, Send, Download,
    TrendingUp, Shield, Activity, Wallet, BarChart3, Clock,
    CircleDot, ScanLine, Camera,
} from 'lucide-react';
import { ArgusLogo } from '../components/ArgusLogo';
import { EthLogo } from '../components/EthLogo';
import { WalletTx } from '../types';

export const GAS_FEE_ARG = 0.001;

import QRCode from 'react-qr-code';
import { BrowserQRCodeReader } from '@zxing/browser';

// ── Toast ───────────────────────────────────────────────────
const Toast = ({ msg, visible }: { msg: string; visible: boolean }) => (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
        <Check className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-bold text-white tracking-wide">{msg}</span>
    </div>
);

// ── Status Badge ────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const s = status === 'CONFIRMED'
        ? { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' }
        : status === 'PENDING'
            ? { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400 animate-pulse' }
            : { cls: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${s.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
};

// ── Main Vault Component ────────────────────────────────────
const Vault = () => {
    const { user } = useAuth();
    const [activeNetwork, setActiveNetwork] = useState<'ARG' | 'ETH'>('ARG');
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [balance, setBalance] = useState({ arg: 0, eth: '0.0000' });
    const [txHistory, setTxHistory] = useState<WalletTx[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copyState, setCopyState] = useState(false);
    const [toast, setToast] = useState({ msg: '', visible: false });
    const [netDropOpen, setNetDropOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<'SEND' | 'RECEIVE' | 'SWAP' | 'BUY' | 'TX_DETAIL' | null>(null);
    const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });
    const [txError, setTxError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [scannerError, setScannerError] = useState('');
    const tokenPrices = useTokenPrices();
    const { arg: argPrice, eth: ethPrice } = tokenPrices;

    useEffect(() => {
        let controls: any = null;
        if (isScanning && videoElement) {
            const scanner = new BrowserQRCodeReader();
            setScannerError('');
            scanner.decodeFromVideoDevice(undefined, videoElement, (result, err, ctrls) => {
                controls = ctrls;
                if (result) {
                    setTxForm(prev => ({ ...prev, recipient: result.getText() }));
                    setIsScanning(false);
                    if (ctrls) ctrls.stop();
                }
                if (err && err.name === 'NotAllowedError') {
                    setScannerError('Camera access denied. Please allow camera permissions.');
                }
            }).catch(e => {
                setScannerError('Could not start camera. ' + e.message);
            });
        }
        return () => {
            if (controls) controls.stop();
        };
    }, [isScanning, videoElement]);

    useEffect(() => {
        if (!user?.uid) return;
        const arg = ArgusSynapseService.generateAddress(user.uid);
        const eth = EthereumService.generateAddress(user.uid);
        setAddresses({ arg, eth });
        saveUserAddresses(user.uid, arg, eth);
    }, [user?.uid]);

    useEffect(() => {
        if (!addresses.eth) return;
        setIsRefreshing(true);
        EthereumService.getBalance(addresses.eth)
            .then(b => setBalance(prev => ({ ...prev, eth: b })))
            .catch(() => setBalance(prev => ({ ...prev, eth: '0.0000' })))
            .finally(() => setIsRefreshing(false));
    }, [addresses.eth, refreshTick]);

    useEffect(() => {
        if (!user?.uid || !addresses.arg || !addresses.eth) return;
        const q = query(
            collection(db, 'wallet_transactions'),
            where('participants', 'array-contains-any', [addresses.arg, addresses.eth]),
            orderBy('createdAt', 'desc'),
        );
        return onSnapshot(q, snap => setTxHistory(snap.docs.map(d => ({ id: d.id, ...d.data() } as WalletTx))));
    }, [user?.uid, addresses.arg, addresses.eth]);

    useEffect(() => {
        if (user) setBalance(prev => ({ ...prev, arg: Math.max(0, user.points || 0) }));
    }, [user?.points]);

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
    };

    const copyAddr = async (addr: string) => {
        try { await navigator.clipboard.writeText(addr); setCopyState(true); showToast('Address copied'); setTimeout(() => setCopyState(false), 2000); } catch { }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); setTxError('');
        const amt = parseFloat(txForm.amount);
        if (isNaN(amt) || amt <= 0) { setTxError('Enter a valid amount > 0'); return; }
        if (activeNetwork === 'ARG' && !ArgusSynapseService.isValidAddress(txForm.recipient)) { setTxError('Invalid ARG address'); return; }
        if (activeNetwork === 'ETH' && !EthereumService.isValidAddress(txForm.recipient)) { setTxError('Invalid 0x address'); return; }
        if (activeNetwork === 'ARG' && balance.arg < amt + GAS_FEE_ARG) { setTxError(`Need ${(amt + GAS_FEE_ARG).toFixed(4)} ARG (incl. gas)`); return; }
        if (activeNetwork === 'ETH' && parseFloat(balance.eth) < amt) { setTxError('Insufficient ETH'); return; }
        setIsProcessing(true);
        try {
            const txHash = '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18);
            if (activeNetwork === 'ARG') {
                const r = await transferARG({ senderUid: user!.uid, senderArgAddress: addresses.arg, recipientArgAddress: txForm.recipient, amount: amt, gasFee: GAS_FEE_ARG, txHash });
                if (!r.success) { setTxError(r.error || 'Failed'); return; }
            } else {
                const { addDoc } = await import('firebase/firestore');
                await addDoc(collection(db, 'wallet_transactions'), { uid: user!.uid, fromUid: user!.uid, toUid: null, chain: 'ETH', type: 'SEND', amount: String(amt), from: addresses.eth, to: txForm.recipient, status: 'CONFIRMED', txHash, createdAt: Date.now(), participants: [addresses.eth, txForm.recipient], gasFee: 0 });
            }
            setTxForm({ recipient: '', amount: '' }); showToast('Tx broadcast ✓'); setActiveModal(null);
        } catch { setTxError('Broadcast failed.'); } finally { setIsProcessing(false); }
    };

    const currentAddr = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
    const truncAddr = currentAddr ? `${currentAddr.slice(0, 10)}...${currentAddr.slice(-8)}` : '—';
    const dispBal = activeNetwork === 'ARG'
        ? { amount: balance.arg, symbol: 'ARG', price: argPrice.priceUsd, dec: 2 }
        : { amount: parseFloat(balance.eth), symbol: 'ETH', price: ethPrice.priceUsd, dec: 4 };
    const usdVal = (dispBal.amount * dispBal.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const netTxs = txHistory.filter(tx => tx.chain === activeNetwork);

    // Both networks total USD
    const totalUsd = (balance.arg * argPrice.priceUsd + parseFloat(balance.eth) * ethPrice.priceUsd)
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="w-full h-full min-h-[100dvh] bg-zinc-950 flex flex-col">
            <Toast msg={toast.msg} visible={toast.visible} />

            {/* ──────────────────────── TOP BAR ──────────────────────── */}
            <div className="hidden lg:flex items-center justify-between px-8 py-3 border-b border-zinc-900/60 bg-zinc-950/90 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-maroon/10 border border-maroon/20">
                        <ArgusLogo className="w-4 h-4 text-maroon" />
                    </div>
                    <span className="text-xs font-black text-white tracking-widest uppercase">Argus Vault</span>
                </div>
                {/* Network pill */}
                <div className="relative">
                    <button onClick={() => setNetDropOpen(!netDropOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-xs font-bold text-white transition-colors">
                        {activeNetwork === 'ARG' ? <ArgusLogo className="w-3.5 h-3.5 text-maroon" /> : <EthLogo className="w-3.5 h-3.5 text-blue-400" />}
                        <span>{activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'}</span>
                        <ChevronDown className="w-3 h-3 text-zinc-500" />
                    </button>
                    {netDropOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setNetDropOpen(false)} />
                            <div className="absolute top-full right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1 overflow-hidden">
                                {[{ id: 'ARG', label: 'Argus GhostDAG', icon: <ArgusLogo className="w-4 h-4 text-maroon" /> }, { id: 'ETH', label: 'Ethereum Mainnet', icon: <EthLogo className="w-4 h-4 text-blue-400" /> }].map(n => (
                                    <button key={n.id} onClick={() => { setActiveNetwork(n.id as any); setNetDropOpen(false); }} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors ${activeNetwork === n.id ? 'bg-zinc-800/60' : ''}`}>
                                        {n.icon}{n.label}{activeNetwork === n.id && <Check className="w-3 h-3 text-maroon ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setRefreshTick(t => t + 1)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="w-7 h-7 rounded-full border border-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900" style={{ backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 2px,rgba(255,255,255,.07) 2px,rgba(255,255,255,.07) 4px)' }} />
                </div>
            </div>

            {/* ──────────────────────── BODY ──────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── SIDEBAR (desktop only) ── */}
                <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-zinc-900 bg-zinc-950/50 overflow-y-auto custom-scrollbar">

                    {/* Net worth hero */}
                    <div className="p-6 border-b border-zinc-900/60">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Portfolio Value</p>
                        <p className="text-3xl font-black text-white tabular-nums">${totalUsd}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">Across all networks</p>
                    </div>

                    {/* Address */}
                    <div className="px-5 py-4 border-b border-zinc-900/60">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Active Address</p>
                        <button onClick={() => copyAddr(currentAddr)} className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-blue-400'}`} />
                                <span className="text-[10px] font-mono text-zinc-300 truncate">{truncAddr}</span>
                            </div>
                            {copyState ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 shrink-0 transition-colors" />}
                        </button>
                    </div>

                    {/* Assets list */}
                    <div className="px-5 py-4 border-b border-zinc-900/60">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-3">Assets</p>
                        <div className="space-y-1">
                            {[
                                { id: 'ARG', label: 'Argus', symbol: 'ARG', amount: balance.arg.toLocaleString(undefined, { minimumFractionDigits: 2 }), usd: (balance.arg * argPrice.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: <ArgusLogo className="w-4 h-4 text-white" />, bg: 'bg-maroon' },
                                { id: 'ETH', label: 'Ethereum', symbol: 'ETH', amount: parseFloat(balance.eth).toLocaleString(undefined, { minimumFractionDigits: 4 }), usd: (parseFloat(balance.eth) * ethPrice.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), icon: <EthLogo className="w-4 h-4" />, bg: 'bg-white' },
                            ].map(a => (
                                <button key={a.id} onClick={() => setActiveNetwork(a.id as any)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${activeNetwork === a.id ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-900/50'}`}>
                                    <div className={`w-8 h-8 rounded-full ${a.bg} flex items-center justify-center shrink-0`}>{a.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white">{a.label}</p>
                                        <p className="text-[9px] text-zinc-500 font-mono truncate">{a.amount} {a.symbol}</p>
                                    </div>
                                    <p className="text-xs font-bold text-white shrink-0">${a.usd}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-5 py-4 flex-1 space-y-3">
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Network Stats</p>
                        {[
                            { label: 'ARG Price', value: `$${argPrice.priceUsd.toFixed(4)}`, icon: <TrendingUp className="w-3 h-3" />, color: 'text-emerald-400' },
                            { label: 'ETH Price', value: `$${ethPrice.priceUsd.toFixed(2)}`, icon: <Activity className="w-3 h-3" />, color: 'text-blue-400' },
                            { label: 'Transactions', value: txHistory.length.toString(), icon: <BarChart3 className="w-3 h-3" />, color: 'text-zinc-400' },
                            { label: 'Gas Fee', value: '0.001 ARG', icon: <Shield className="w-3 h-3" />, color: 'text-zinc-400' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between">
                                <div className={`flex items-center gap-1.5 ${s.color}`}>
                                    {s.icon}
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{s.label}</span>
                                </div>
                                <span className="text-[10px] font-black text-white font-mono">{s.value}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── MAIN CONTENT ── */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* Mobile top bar */}
                    <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950">
                        <div className="relative">
                            <button onClick={() => setNetDropOpen(!netDropOpen)} className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-white">
                                {activeNetwork === 'ARG' ? <ArgusLogo className="w-3.5 h-3.5 text-maroon" /> : <EthLogo className="w-3.5 h-3.5 text-blue-400" />}
                                <span>{activeNetwork === 'ARG' ? 'Argus' : 'Ethereum'}</span>
                                <ChevronDown className="w-3 h-3 text-zinc-500" />
                            </button>
                            {netDropOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setNetDropOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 py-1">
                                        {[{ id: 'ARG', label: 'Argus GhostDAG', icon: <ArgusLogo className="w-4 h-4 text-maroon" /> }, { id: 'ETH', label: 'Ethereum Mainnet', icon: <EthLogo className="w-4 h-4 text-blue-400" /> }].map(n => (
                                            <button key={n.id} onClick={() => { setActiveNetwork(n.id as any); setNetDropOpen(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors">
                                                {n.icon}{n.label}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <button onClick={() => copyAddr(currentAddr)} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-300">
                            {truncAddr.slice(0, 12)}…
                            {copyState ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-600" />}
                        </button>
                    </div>

                    {/* Balance Hero Block */}
                    <div className="relative overflow-hidden border-b border-zinc-900/60">
                        <div className={`absolute inset-0 opacity-5 ${activeNetwork === 'ARG' ? 'bg-gradient-to-r from-maroon via-transparent to-transparent' : 'bg-gradient-to-r from-blue-500 via-transparent to-transparent'}`} />
                        <div className="relative px-6 lg:px-10 py-8 lg:py-10 flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16">
                            <div>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">
                                    {activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'} Balance
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl lg:text-6xl font-black text-white tabular-nums">${usdVal}</span>
                                    <span className="text-sm text-zinc-500 font-mono">USD</span>
                                </div>
                                <p className="text-zinc-400 text-sm mt-2 font-mono">
                                    {dispBal.amount.toLocaleString(undefined, { minimumFractionDigits: dispBal.dec })} {dispBal.symbol}
                                    <span className="text-zinc-600 ml-2">@ ${dispBal.price.toFixed(4)}</span>
                                </p>
                            </div>
                            {/* Action Buttons — wide row on desktop */}
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { label: 'Send', modal: 'SEND', icon: <Send className="w-4 h-4" />, cls: 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700' },
                                    { label: 'Receive', modal: 'RECEIVE', icon: <Download className="w-4 h-4" />, cls: 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700' },
                                    { label: 'Swap', modal: 'SWAP', icon: <Repeat className="w-4 h-4" />, cls: 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700' },
                                    { label: 'Buy', modal: 'BUY', icon: <CreditCard className="w-4 h-4" />, cls: 'bg-blue-600 hover:bg-blue-500 text-white border-blue-500' },
                                ].map(a => (
                                    <button key={a.label} onClick={() => setActiveModal(a.modal as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${a.cls}`}>
                                        {a.icon}{a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Desktop layout: side-by-side panels ── */}
                    <div className="lg:flex lg:divide-x lg:divide-zinc-900 flex-1">

                        {/* Left content: Activity */}
                        <div className="flex-1 min-w-0">
                            <div className="px-6 lg:px-8 py-5 flex items-center justify-between border-b border-zinc-900/50">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-zinc-600" />
                                    <h2 className="text-xs font-black text-white uppercase tracking-widest">Transaction History</h2>
                                    {netTxs.length > 0 && <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[9px] font-bold">{netTxs.length}</span>}
                                </div>
                                <span className="text-[9px] text-zinc-600 font-mono uppercase">{activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'}</span>
                            </div>

                            {netTxs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                                        <Wallet className="w-6 h-6 text-zinc-700" />
                                    </div>
                                    <p className="text-sm font-black text-white mb-1">No transactions yet</p>
                                    <p className="text-xs text-zinc-600">Your {activeNetwork} activity will appear here.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-900/40">
                                    {netTxs.map(tx => {
                                        const myAddress = tx.chain === 'ARG' ? addresses.arg : addresses.eth;
                                        const isSent = tx.from?.toLowerCase() === myAddress?.toLowerCase();
                                        const amt = Number(tx.amount);
                                        return (
                                            <div key={tx.id} onClick={() => { setSelectedTx(tx); setActiveModal('TX_DETAIL'); }} className="flex items-center gap-4 px-6 lg:px-8 py-4 hover:bg-zinc-900/20 transition-colors cursor-pointer group">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${isSent ? 'bg-zinc-900 border-zinc-800' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                                                    {isSent ? <ArrowUpRight className="w-4 h-4 text-zinc-400" /> : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold text-white">{isSent ? 'Sent' : 'Received'} {tx.chain}</p>
                                                        <StatusBadge status={tx.status} />
                                                    </div>
                                                    <p className="text-[10px] text-zinc-600 font-mono truncate">
                                                        {isSent ? `To: ${tx.to?.slice(0, 16)}…` : `From: ${tx.from?.slice(0, 16)}…`}
                                                        <span className="ml-2">{new Date(tx.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`text-sm font-black tabular-nums ${isSent ? 'text-white' : 'text-emerald-400'}`}>
                                                        {isSent ? '−' : '+'}{amt.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.chain}
                                                    </p>
                                                    {tx.gasFee > 0 && <p className="text-[9px] text-zinc-600 font-mono">Gas: {tx.gasFee}</p>}
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Right panel: Receive QR + Network info (desktop inline) */}
                        <div className="hidden lg:flex flex-col w-80 shrink-0">
                            <div className="px-6 py-5 border-b border-zinc-900/50">
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Receive {activeNetwork}</p>
                            </div>
                            <div className="p-6 flex flex-col items-center gap-4">
                                <div className="w-40 h-40 p-3 bg-white rounded-2xl flex items-center justify-center">
                                    <QRCode value={currentAddr || 'loading'} size={136} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                                </div>
                                <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 cursor-pointer hover:border-zinc-700 transition-colors group" onClick={() => copyAddr(currentAddr)}>
                                    <p className="text-[9px] font-mono text-zinc-500 break-all leading-relaxed">{currentAddr}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-maroon transition-colors">
                                        {copyState ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                        {copyState ? 'Copied!' : 'Copy address'}
                                    </div>
                                </div>
                                <p className="text-[9px] text-zinc-600 text-center leading-relaxed">Only send <strong className="text-zinc-400">{activeNetwork}</strong> assets to this address on the {activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum'} network.</p>
                            </div>

                            {/* Price ticker */}
                            <div className="mt-auto border-t border-zinc-900/60 px-6 py-5 space-y-3">
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Live Prices</p>
                                {[
                                    { sym: 'ARG', price: argPrice.priceUsd, change: argPrice.change24h, icon: <ArgusLogo className="w-3.5 h-3.5 text-maroon" /> },
                                    { sym: 'ETH', price: ethPrice.priceUsd, change: ethPrice.change24h, icon: <EthLogo className="w-3.5 h-3.5 text-blue-400" /> },
                                ].map(p => (
                                    <div key={p.sym} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">{p.icon}<span className="text-xs font-bold text-white">{p.sym}</span></div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-white">${p.price.toFixed(p.sym === 'ETH' ? 2 : 4)}</p>
                                            <p className={`text-[9px] font-bold ${p.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{p.change >= 0 ? '+' : ''}{p.change}% 24h</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── MODALS ─────────────────────────────────────────────── */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-md bg-zinc-900 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
                            <h2 className="text-xs font-black text-white uppercase tracking-widest">
                                {activeModal === 'SEND' && `Send ${activeNetwork}`}
                                {activeModal === 'RECEIVE' && `Receive ${activeNetwork}`}
                                {activeModal === 'SWAP' && 'Swap'}
                                {activeModal === 'BUY' && 'Buy Crypto'}
                                {activeModal === 'TX_DETAIL' && 'Transaction Details'}
                            </h2>
                            <button onClick={() => setActiveModal(null)} className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                            {activeModal === 'SEND' && (
                                <div className="space-y-4">
                                    {isScanning ? (
                                        <div className="flex flex-col items-center bg-zinc-950 border border-zinc-800 rounded-2xl p-4 animate-fade-in-up">
                                            <div className="w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden relative mb-4">
                                                <video ref={setVideoElement} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 pointer-events-none border-[1.5px] border-emerald-500/50 rounded-xl max-w-[70%] max-h-[70%] m-auto"></div>
                                                <div className="absolute top-3 left-3 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-zinc-800">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                    <span className="text-[9px] font-bold text-white uppercase tracking-widest">Live Scanning</span>
                                                </div>
                                            </div>
                                            {scannerError && <p className="text-[10px] text-red-400 text-center mb-4">{scannerError}</p>}
                                            <button onClick={() => setIsScanning(false)} className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors w-full">Cancel Scanner</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSend} className="space-y-4 animate-fade-in-up">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Recipient</label>
                                                    <button type="button" onClick={() => setIsScanning(true)} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">
                                                        <ScanLine className="w-3 h-3" /> Scan QR
                                                    </button>
                                                </div>
                                                <input required autoFocus value={txForm.recipient} onChange={e => { setTxForm({ ...txForm, recipient: e.target.value }); setTxError(''); }} placeholder={activeNetwork === 'ARG' ? 'arg1...' : '0x...'} className="w-full bg-zinc-950 border border-zinc-800 text-white py-3 px-4 rounded-xl focus:border-maroon outline-none font-mono text-xs placeholder:text-zinc-700 transition-all" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between">
                                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Amount</label>
                                                    <button type="button" onClick={() => setTxForm({ ...txForm, amount: String(Math.max(0, dispBal.amount - GAS_FEE_ARG)) })} className="text-[9px] text-maroon hover:underline font-bold">MAX</button>
                                                </div>
                                                <div className="relative">
                                                    <input required type="number" step="any" min="0" value={txForm.amount} onChange={e => { setTxForm({ ...txForm, amount: e.target.value }); setTxError(''); }} placeholder="0.00" className="w-full bg-zinc-950 border border-zinc-800 text-white py-4 px-4 pr-16 rounded-xl focus:border-maroon outline-none text-2xl font-black text-center placeholder:text-zinc-700 transition-all" />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{activeNetwork}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between px-1 text-xs">
                                                <span className="text-zinc-600">Available</span>
                                                <span className="text-zinc-300 font-mono font-bold">{dispBal.amount.toLocaleString(undefined, { minimumFractionDigits: dispBal.dec })} {activeNetwork}</span>
                                            </div>
                                            {activeNetwork === 'ARG' && <div className="flex justify-between px-3 py-2 bg-zinc-950/70 border border-zinc-800/50 rounded-xl text-xs"><span className="text-zinc-500">Gas fee</span><span className="text-zinc-300 font-mono">0.001 ARG</span></div>}
                                            {txError && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"><AlertCircle className="w-4 h-4 text-red-400 shrink-0" /><p className="text-[10px] text-red-400">{txError}</p></div>}
                                            <button type="submit" disabled={isProcessing} className="w-full py-3.5 bg-maroon text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                                                {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : 'Confirm & Send'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {activeModal === 'RECEIVE' && (
                                <div className="flex flex-col items-center gap-5">
                                    <div className="p-4 bg-white rounded-2xl w-40 h-40 flex items-center justify-center"><QRCode value={currentAddr} size={128} style={{ height: "auto", maxWidth: "100%", width: "100%" }} /></div>
                                    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors group" onClick={() => copyAddr(currentAddr)}>
                                        <p className="text-xs font-mono text-zinc-300 break-all text-center leading-relaxed">{currentAddr}</p>
                                        <div className="flex items-center justify-center gap-1.5 mt-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-maroon">
                                            {copyState ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copyState ? 'Copied!' : 'Copy Address'}
                                        </div>
                                    </div>
                                    <p className="text-center text-[9px] text-zinc-600 leading-relaxed">Only send <strong className="text-zinc-400">{activeNetwork}</strong> to this address.</p>
                                </div>
                            )}

                            {(activeModal === 'SWAP' || activeModal === 'BUY') && (
                                <div className="flex flex-col items-center text-center py-10 gap-4">
                                    <div className="w-14 h-14 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
                                        {activeModal === 'SWAP' ? <Repeat className="w-6 h-6 text-zinc-500" /> : <CreditCard className="w-6 h-6 text-zinc-500" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white mb-1">{activeModal === 'SWAP' ? 'DEX Audit Underway' : 'On-Ramp Coming Soon'}</p>
                                        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">{activeModal === 'SWAP' ? 'The Argus DEX swap module is under security audit. Available at mainnet launch.' : 'Fiat on-ramp integrations finalized at TGE.'}</p>
                                    </div>
                                </div>
                            )}

                            {activeModal === 'TX_DETAIL' && selectedTx && (
                                <div className="space-y-4">
                                    <div className="text-center pb-4 border-b border-zinc-800">
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Amount</p>
                                        <p className="text-4xl font-black text-white">{Number(selectedTx.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}<span className="text-sm text-zinc-500 ml-2">{selectedTx.chain}</span></p>
                                        <div className="mt-3 flex justify-center"><StatusBadge status={selectedTx.status} /></div>
                                    </div>
                                    {[
                                        { l: 'Date', v: new Date(selectedTx.createdAt).toLocaleString() },
                                        { l: 'Network', v: selectedTx.chain === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet' },
                                        { l: 'Type', v: selectedTx.type || 'TRANSFER' },
                                        {
                                            l: 'Latency', v: (() => {
                                                const hashVal = selectedTx.txHash.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
                                                if (selectedTx.chain === 'ETH') return `${(12 + (hashVal % 34) + ((hashVal % 100) / 100)).toFixed(2)}s`;
                                                return `${(45 + (hashVal % 800) + ((hashVal % 100) / 100)).toFixed(2)}ms`;
                                            })()
                                        },
                                    ].map(r => (
                                        <div key={r.l} className="flex justify-between text-xs"><span className="text-zinc-500 font-bold uppercase tracking-wider">{r.l}</span><span className="text-zinc-200">{r.v}</span></div>
                                    ))}
                                    <div className="flex justify-between items-start gap-3 text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">From</span>
                                        <div className="flex items-center gap-1.5"><span className="text-zinc-300 font-mono text-[9px] break-all">{selectedTx.from}</span><button onClick={() => navigator.clipboard.writeText(selectedTx.from)}><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-300" /></button></div>
                                    </div>
                                    <div className="flex justify-between items-start gap-3 text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">To</span>
                                        <div className="flex items-center gap-1.5"><span className="text-zinc-300 font-mono text-[9px] break-all">{selectedTx.to}</span><button onClick={() => navigator.clipboard.writeText(selectedTx.to)}><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-300" /></button></div>
                                    </div>
                                    {selectedTx.gasFee > 0 && <div className="flex justify-between text-xs"><span className="text-zinc-500 font-bold uppercase tracking-wider">Gas</span><span className="text-zinc-300 font-mono">{selectedTx.gasFee} ARG</span></div>}
                                    <div className="pt-3 border-t border-zinc-800/60">
                                        <div className="flex justify-between items-start gap-3 text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">Tx Hash</span>
                                            <div className="flex items-center gap-1.5"><span className="text-zinc-600 font-mono text-[9px] break-all">{selectedTx.txHash}</span><button onClick={() => navigator.clipboard.writeText(selectedTx.txHash)}><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-300" /></button></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-[9px] text-zinc-700 font-mono uppercase tracking-widest pt-1">Argus Protocol — Immutable Ledger</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vault;
