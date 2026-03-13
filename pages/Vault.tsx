
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import { db, saveUserAddresses, transferARG } from '../services/firebase';
import { useTokenPrices } from '../services/TokenPriceService';
import { collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import {
    ArrowUpRight, ArrowDownLeft, Copy, Check, Loader2,
    AlertCircle, X, ChevronDown, CreditCard, Repeat,
    History, ExternalLink, RefreshCw, Send, Download,
    TrendingUp, Shield, Activity, Wallet, BarChart3, Clock,
    CircleDot, ScanLine, Camera, Radio, Info, Terminal, ChevronRight, Zap
} from 'lucide-react';
import { ArgusLogo } from '../components/ArgusLogo';
import { EthLogo } from '../components/EthLogo';
import { WalletTx } from '../types';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { AnimatedNumber } from '../components/AnimatedNumber';
import MatrixBackground from '../components/MatrixBackground';
import QRCode from 'react-qr-code';
import { BrowserQRCodeReader } from '@zxing/browser';

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemAnim: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

export const GAS_FEE_ARG = 0.001;

// ── Status Badge (Standardized) ─────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const s = status === 'CONFIRMED'
        ? { cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' }
        : status === 'PENDING'
            ? { cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-500 animate-pulse' }
            : { cls: 'text-maroon bg-maroon/10 border-maroon/20', dot: 'bg-maroon' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${s.cls} italic`}>
            <span className={`w-1 h-1 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
};

const Vault = () => {
    const { user } = useAuth();
    const [activeNetwork, setActiveNetwork] = useState<'ARG' | 'ETH'>('ARG');
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [balance, setBalance] = useState({ arg: 0, eth: '0.0000' });
    const [txHistory, setTxHistory] = useState<WalletTx[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copyState, setCopyState] = useState(false);
    const [activeModal, setActiveModal] = useState<'SEND' | 'RECEIVE' | 'SWAP' | 'BUY' | 'TX_DETAIL' | null>(null);
    const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });
    const [txError, setTxError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
    const [scannerError, setScannerError] = useState('');
    const { arg: argPrice, eth: ethPrice } = useTokenPrices();

    useEffect(() => {
        let controls: any = null;
        if (isScanning && videoElement) {
            const scanner = new BrowserQRCodeReader();
            scanner.decodeFromVideoDevice(undefined, videoElement, (result, err, ctrls) => {
                controls = ctrls;
                if (result) {
                    setTxForm(prev => ({ ...prev, recipient: result.getText() }));
                    setIsScanning(false);
                    if (ctrls) ctrls.stop();
                }
            }).catch(e => setScannerError('Scanner unit failed: ' + e.message));
        }
        return () => { if (controls) controls.stop(); };
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
        const fetchEthBalance = () => {
            setIsRefreshing(true);
            EthereumService.getBalance(addresses.eth)
                .then(b => setBalance(prev => ({ ...prev, eth: b })))
                .finally(() => setIsRefreshing(false));
        };
        fetchEthBalance();
        const interval = setInterval(fetchEthBalance, 30000);
        return () => clearInterval(interval);
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

    const copyAddr = async (addr: string) => {
        try { await navigator.clipboard.writeText(addr); setCopyState(true); setTimeout(() => setCopyState(false), 2000); } catch { }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault(); setTxError('');
        const amt = parseFloat(txForm.amount);
        if (isNaN(amt) || amt <= 0) { setTxError('QUANTITY_ERR: Enter valid amount'); return; }
        if (activeNetwork === 'ARG' && !ArgusSynapseService.isValidAddress(txForm.recipient)) { setTxError('ADDR_ERR: Invalid ARG identity'); return; }
        if (activeNetwork === 'ETH' && !EthereumService.isValidAddress(txForm.recipient)) { setTxError('ADDR_ERR: Invalid 0x identity'); return; }
        if (activeNetwork === 'ARG' && balance.arg < amt + GAS_FEE_ARG) { setTxError(`FUNDS_ERR: Insufficient ARG (Need ${amt + GAS_FEE_ARG})`); return; }
        setIsProcessing(true);
        try {
            const txHash = '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18);
            if (activeNetwork === 'ARG') {
                const r = await transferARG({ senderUid: user!.uid, senderArgAddress: addresses.arg, recipientArgAddress: txForm.recipient, amount: amt, gasFee: GAS_FEE_ARG, txHash });
                if (!r.success) { setTxError(r.error || 'TRANS_FAIL'); return; }
            } else {
                await addDoc(collection(db, 'wallet_transactions'), { uid: user!.uid, fromUid: user!.uid, toUid: null, chain: 'ETH', type: 'SEND', amount: String(amt), from: addresses.eth, to: txForm.recipient, status: 'CONFIRMED', txHash, createdAt: Date.now(), participants: [addresses.eth, txForm.recipient], gasFee: 0 });
            }
            setTxForm({ recipient: '', amount: '' }); setActiveModal(null);
        } catch { setTxError('NETWORK_ERR: Broadcast interrupted'); } finally { setIsProcessing(false); }
    };

    const currentAddr = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
    const dispBal = activeNetwork === 'ARG'
        ? { amount: balance.arg, symbol: 'ARG', price: argPrice.priceUsd, dec: 2 }
        : { amount: parseFloat(balance.eth), symbol: 'ETH', price: ethPrice.priceUsd, dec: 4 };
    const netTxs = txHistory.filter(tx => tx.chain === activeNetwork);

    return (
        <div className="relative pt-32 pb-40 min-h-screen bg-[#050505] text-zinc-300 font-mono selection:bg-maroon selection:text-white overflow-x-hidden">
            
            {/* SYSTEM OVERLAY */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <MatrixBackground color="rgba(128, 0, 0, 0.05)" opacity={0.15} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(128,0,0,0.06),rgba(128,0,0,0.02),rgba(128,0,0,0.06))] bg-[length:100%_2px,3px_100%]"></div>
            </div>

            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-[1700px] mx-auto px-6 relative z-10 w-full">
                
                {/* VAULT TOP BAR */}
                <motion.div variants={itemAnim} className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6 bg-zinc-950/80 border border-white/[0.05] p-6 rounded-xl backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center border border-maroon/20">
                            <Shield className="w-6 h-6 text-maroon animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-none mb-2 italic">Argus_Protocol_Vault</h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Access_Granted · Synchronized Ledger</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-8">
                        <div className="text-right">
                            <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1">Portfolio_Valuation</p>
                            <p className="text-xl font-black text-white">$<AnimatedNumber value={balance.arg * argPrice.priceUsd + parseFloat(balance.eth) * ethPrice.priceUsd} decimals={2} /></p>
                        </div>
                        <div className="h-10 w-px bg-white/[0.05]"></div>
                        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-lg border border-white/[0.05]">
                            <button onClick={() => setActiveNetwork('ARG')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeNetwork === 'ARG' ? 'bg-maroon text-white shadow-[0_0_12px_rgba(128,0,0,0.2)]' : 'text-zinc-500 hover:text-white'}`}>GHOSTDAG</button>
                            <button onClick={() => setActiveNetwork('ETH')} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${activeNetwork === 'ETH' ? 'bg-zinc-800 text-white border border-white/[0.05]' : 'text-zinc-500 hover:text-white'}`}>ETHEREUM</button>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT PANEL: ASSETS & INFO */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Selected Asset Module */}
                        <motion.div variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] p-8 rounded-xl group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                {activeNetwork === 'ARG' ? <ArgusLogo className="w-32 h-32" /> : <EthLogo className="w-32 h-32" />}
                            </div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-4">Active_Network_Allocation</p>
                            <div className="space-y-1 mb-8">
                                <p className="text-sm font-black text-zinc-600 uppercase tracking-widest leading-none">{activeNetwork === 'ARG' ? 'Argus Synapse' : 'Ethereum L1'}</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums"><AnimatedNumber value={dispBal.amount} decimals={dispBal.dec} /></span>
                                    <span className="text-xl font-black text-maroon">{dispBal.symbol}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase mt-2 italic">≈ $<AnimatedNumber value={dispBal.amount * dispBal.price} decimals={2} /> USD</p>
                            </div>

                            <div className="space-y-3">
                                <button onClick={() => copyAddr(currentAddr)} className="w-full flex items-center justify-between p-4 bg-black/40 border border-white/[0.05] rounded-lg hover:border-maroon/30 transition-all group/addr">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
                                        <span className="text-[10px] text-zinc-400 font-mono uppercase truncate max-w-[180px]">{currentAddr}</span>
                                    </div>
                                    {copyState ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-600 group-hover/addr:text-white transition-colors" />}
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setActiveModal('SEND')} className="py-3 bg-maroon hover:brightness-110 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg shadow-[0_0_15px_rgba(128,0,0,0.15)] transition-all">TERMINATE_OUT</button>
                                    <button onClick={() => setActiveModal('RECEIVE')} className="py-3 bg-zinc-900 border border-white/[0.05] hover:border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-lg transition-all">RECEIVE_IN</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Network Metadata Panel */}
                        <motion.div variants={itemAnim} className="bg-[#0a0a0a] border border-white/[0.05] rounded-xl overflow-hidden">
                            <div className="p-5 border-b border-white/[0.05] flex items-center gap-3">
                                <Terminal className="w-4 h-4 text-maroon" />
                                <span className="text-xs font-black uppercase text-white tracking-widest italic">Vault_Metadata</span>
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { l: 'Ledger_Sync', v: 'OPTIMAL', c: 'text-emerald-500' },
                                    { l: 'Network_Security', v: 'RSA-4096-ECC', c: 'text-white' },
                                    { l: 'Estimated_Gas', v: activeNetwork === 'ARG' ? '0.001 ARG' : 'DYNAMIC', c: 'text-maroon' },
                                    { l: 'Identity_Proof', v: 'NODE_VERIFIED', c: 'text-zinc-500' }
                                ].map((s, i) => (
                                    <div key={i} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/[0.02]">
                                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{s.l}</span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${s.c}`}>{s.v}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT PANEL: TRANSACTION LEDGER */}
                    <div className="lg:col-span-8 space-y-6">
                        <motion.div variants={itemAnim} className="bg-zinc-950/50 border border-white/[0.05] rounded-xl overflow-hidden flex flex-col min-h-[600px]">
                            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-black/40 backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <History className="w-4 h-4 text-maroon" />
                                    <span className="text-xs font-black uppercase text-white tracking-widest italic">Protocol_Event_Ledger</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="px-3 py-1 bg-maroon/10 border border-maroon/20 rounded text-[9px] font-black text-maroon uppercase tracking-widest">LIVE_FEED</div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20">
                                {netTxs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center py-40 opacity-20">
                                        <div className="w-16 h-16 border border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
                                            <Wallet className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">No_Ledger_Events_Detected</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/[0.03]">
                                        {netTxs.map(tx => {
                                            const myAddress = tx.chain === 'ARG' ? addresses.arg : addresses.eth;
                                            const isSent = tx.from?.toLowerCase() === myAddress?.toLowerCase();
                                            return (
                                                <div key={tx.id} onClick={() => { setSelectedTx(tx); setActiveModal('TX_DETAIL'); }} className="p-6 flex items-center gap-6 hover:bg-white/[0.02] transition-all cursor-pointer group">
                                                    <div className={`w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${isSent ? 'bg-zinc-900 border-white/5 opacity-60 group-hover:opacity-100' : 'bg-maroon/5 border-maroon/20'}`}>
                                                        {isSent ? <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-maroon transition-colors" /> : <ArrowDownLeft className="w-5 h-5 text-maroon" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-sm font-black text-white italic">{isSent ? 'SIG_OUT_EVENT' : 'SIG_IN_EVENT'}</span>
                                                            <StatusBadge status={tx.status} />
                                                        </div>
                                                        <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-tight truncate">
                                                            IDENT: {tx.txHash.slice(0, 24)}...
                                                        </p>
                                                        <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">TIMESTAMP: {new Date(tx.createdAt).toLocaleString('en-GB')}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-lg font-black tabular-nums italic tracking-tighter ${isSent ? 'text-zinc-400 group-hover:text-white transition-colors' : 'text-maroon shadow-maroon/20'}`}>
                                                            {isSent ? '-' : '+'}{Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                                        </p>
                                                        <span className="text-[10px] font-black text-zinc-600 uppercase">{tx.chain}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* MODALS (Standardized) */}
            <AnimatePresence>
                {activeModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] flex items-center justify-center p-6 sm:p-4 backdrop-blur-md bg-black/80">
                        <div className="absolute inset-0" onClick={() => setActiveModal(null)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/[0.05] rounded-xl shadow-2xl overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-white/[0.05] flex items-center justify-between bg-zinc-900/40">
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] font-mono italic">
                                    {activeModal === 'SEND' && 'Initiate_Transfer'}
                                    {activeModal === 'RECEIVE' && 'Secure_Receive_Bridge'}
                                    {activeModal === 'TX_DETAIL' && 'Ledger_Deep_Audit'}
                                </h2>
                                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                {activeModal === 'SEND' && (
                                    <form onSubmit={handleSend} className="space-y-6">
                                        {isScanning ? (
                                            <div className="space-y-4">
                                                <div className="aspect-square bg-black rounded-xl border border-maroon/20 overflow-hidden relative">
                                                    <video ref={setVideoElement} className="w-full h-full object-cover grayscale contrast-125" />
                                                    <div className="absolute inset-0 border-[2px] border-maroon/40 m-auto w-[60%] h-[60%] animate-pulse rounded-lg shadow-[0_0_20px_#800000]"></div>
                                                </div>
                                                <button type="button" onClick={() => setIsScanning(false)} className="w-full py-3 bg-zinc-900 border border-white/5 rounded text-[10px] font-black uppercase tracking-widest">ABORT_SCAN</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Recipient_Address</label>
                                                        <button type="button" onClick={() => setIsScanning(true)} className="flex items-center gap-2 text-[9px] font-black uppercase text-maroon hover:brightness-125"><ScanLine className="w-4 h-4" /> SCAN_QR</button>
                                                    </div>
                                                    <input value={txForm.recipient} onChange={e => setTxForm({...txForm, recipient: e.target.value})} placeholder="ENTR_ID..." className="w-full bg-black border border-white/[0.05] p-4 text-xs font-mono text-white focus:border-maroon focus:outline-none transition-all rounded" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Transfer_Quantity</label>
                                                    <div className="relative">
                                                        <input type="number" step="any" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} placeholder="0.0000" className="w-full bg-black border border-white/[0.05] p-5 text-3xl font-black text-white italic focus:border-maroon focus:outline-none transition-all rounded text-center tracking-tighter" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-maroon">{activeNetwork}</span>
                                                    </div>
                                                </div>
                                                {txError && <div className="p-4 bg-maroon/10 border border-maroon/20 rounded flex items-center gap-3"><AlertCircle className="w-4 h-4 text-maroon" /><p className="text-[9px] font-black text-maroon uppercase">{txError}</p></div>}
                                                <button type="submit" disabled={isProcessing} className="w-full py-4 bg-maroon text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-lg shadow-[0_0_20px_rgba(128,0,0,0.3)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                                                    {isProcessing ? 'SYNCHRONIZING...' : 'EXECUTE_TRANSFER'}
                                                </button>
                                            </>
                                        )}
                                    </form>
                                )}

                                {activeModal === 'RECEIVE' && (
                                    <div className="flex flex-col items-center gap-8 py-4">
                                        <div className="p-6 bg-white rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.1)]"><QRCode value={currentAddr} size={180} /></div>
                                        <div className="w-full p-4 bg-black border border-white/[0.05] rounded-lg text-center cursor-pointer hover:border-maroon/40 transition-all group" onClick={() => copyAddr(currentAddr)}>
                                            <p className="text-xs font-mono text-zinc-300 break-all mb-3 px-4">{currentAddr}</p>
                                            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-maroon transition-colors">
                                                {copyState ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                                {copyState ? 'IDENT_COPIED' : 'COPY_IDENTIFIER'}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest max-w-[280px] text-center italic">Only initiate <span className="text-white">{activeNetwork}</span> bridge connections. Misalignment will result in permanent packet loss.</p>
                                    </div>
                                )}

                                {activeModal === 'TX_DETAIL' && selectedTx && (
                                    <div className="space-y-6 py-2">
                                        <div className="text-center pb-8 border-b border-white/[0.05]">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Quantity_Verified</p>
                                            <div className="flex items-center justify-center gap-3">
                                                <p className="text-5xl font-black text-white italic tracking-tighter tabular-nums"><AnimatedNumber value={Number(selectedTx.amount)} decimals={4} /></p>
                                                <span className="text-sm font-black text-maroon mt-4">{selectedTx.chain}</span>
                                            </div>
                                            <div className="mt-4 inline-block"><StatusBadge status={selectedTx.status} /></div>
                                        </div>
                                        <div className="space-y-3 font-mono">
                                            {[
                                                { l: 'EVENT_CLOCK', v: new Date(selectedTx.createdAt).toLocaleString() },
                                                { l: 'LEDGER_PATH', v: selectedTx.chain === 'ARG' ? 'GHOSTDAG_01' : 'ETH_MAINNET' },
                                                { l: 'NODE_FROM', v: selectedTx.from.slice(0, 16) + '...' },
                                                { l: 'NODE_TO', v: selectedTx.to.slice(0, 16) + '...' },
                                                { l: 'TX_IDENTIFIER', v: selectedTx.txHash.slice(0, 32) + '...' }
                                            ].map(r => (
                                                <div key={r.l} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/[0.02] rounded">
                                                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{r.l}</span>
                                                    <span className="text-[10px] text-zinc-300 font-mono tracking-tight">{r.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-center text-[8px] font-black text-zinc-700 uppercase tracking-[0.4em] pt-4">Argus_Protocol — Final_Settlement_Audit</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Vault;
