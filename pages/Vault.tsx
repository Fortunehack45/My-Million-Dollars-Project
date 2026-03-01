import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import {
    db,
    saveUserAddresses,
    transferARG,
} from '../services/firebase';
import { useTokenPrices } from '../services/TokenPriceService';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import {
    ArrowUpRight,
    ArrowDownLeft,
    Copy,
    Check,
    Loader2,
    AlertCircle,
    X,
    ChevronDown,
    CreditCard,
    Repeat,
    History,
    ExternalLink,
    RefreshCw,
} from 'lucide-react';
import { ArgusLogo } from '../components/ArgusLogo';
import { EthLogo } from '../components/EthLogo';

// ─── Types ────────────────────────────────────────────
import { WalletTx } from '../types';

export const GAS_FEE_ARG = 0.001;

// ─── QR Code SVG Simulation ───────────────────────────
const QRCode = ({ data }: { data: string }) => {
    const size = 9;
    const hash = data.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const cells: boolean[] = [];
    for (let i = 0; i < size * size; i++) {
        cells.push(((hash * (i + 7) * 13) % 100) > 42);
    }
    [0, 1, 2, 18, 19, 20, 6, 15, 60, 61, 62, 78, 79, 80].forEach(i => (cells[i] = true));
    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
            <rect width={size} height={size} fill="white" />
            {cells.map((on, i) =>
                on ? (
                    <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="#0f0f0f" />
                ) : null
            )}
        </svg>
    );
};

// ─── Toast ────────────────────────────────────────────
const Toast = ({ msg, visible }: { msg: string; visible: boolean }) => (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <Check className="w-4 h-4 text-maroon" />
        <span className="text-xs font-bold text-white tracking-wider">{msg}</span>
    </div>
);

// ─── Status Badge ─────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const cfg =
        status === 'CONFIRMED' ? { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' } :
            status === 'PENDING' ? { cls: 'bg-amber-500/10  text-amber-400  border-amber-500/20', dot: 'bg-amber-500 animate-pulse' } :
                { cls: 'bg-red-500/10    text-red-400    border-red-500/20', dot: 'bg-red-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${cfg.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
        </span>
    );
};

// ─── Main Component ────────────────────────────────────
const Vault = () => {
    const { user } = useAuth();

    // Core state
    const [activeNetwork, setActiveNetwork] = useState<'ARG' | 'ETH'>('ARG');
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [balance, setBalance] = useState({ arg: 0, eth: '0.00' });
    const [txHistory, setTxHistory] = useState<WalletTx[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState<'TOKENS' | 'ACTIVITY'>('TOKENS');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [copyState, setCopyState] = useState<'arg' | 'eth' | null>(null);
    const [toast, setToast] = useState({ msg: '', visible: false });

    // Modals
    const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
    const [activeModal, setActiveModal] = useState<'SEND' | 'RECEIVE' | 'SWAP' | 'BUY' | 'TX_DETAIL' | null>(null);
    const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);

    // Send Form
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });
    const [txError, setTxError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Live token prices
    const tokenPrices = useTokenPrices();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Derivation + Persistence
    useEffect(() => {
        if (user?.uid) {
            const arg = ArgusSynapseService.generateAddress(user.uid);
            const eth = EthereumService.generateAddress(user.uid);
            setAddresses({ arg, eth });
            saveUserAddresses(user.uid, arg, eth);
        }
    }, [user?.uid]);

    // Fetch ETH balance
    useEffect(() => {
        let mounted = true;
        const fetchEth = async () => {
            if (!addresses.eth) return;
            setIsRefreshing(true);
            try {
                const ethBal = await EthereumService.getBalance(addresses.eth);
                if (mounted) setBalance(prev => ({ ...prev, eth: ethBal }));
            } catch {
                if (mounted) setBalance(prev => ({ ...prev, eth: '0.00' }));
            } finally {
                if (mounted) setIsRefreshing(false);
            }
        };
        fetchEth();
    }, [addresses.eth, refreshTrigger]);

    // Subscribe to tx history
    useEffect(() => {
        if (!user?.uid || !addresses.arg || !addresses.eth) return;
        const q = query(
            collection(db, 'wallet_transactions'),
            where('participants', 'array-contains-any', [addresses.arg, addresses.eth]),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, snapshot => {
            const txs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as WalletTx));
            setTxHistory(txs);
        });
        return () => unsub();
    }, [user?.uid, addresses.arg, addresses.eth]);

    // Sync ARG balance from user.points
    useEffect(() => {
        if (!user) return;
        setBalance(prev => ({ ...prev, arg: Math.max(0, user.points || 0) }));
    }, [user?.points]);

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
    };

    const copyAddress = async () => {
        const addr = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
        try {
            await navigator.clipboard.writeText(addr);
            setCopyState(activeNetwork === 'ARG' ? 'arg' : 'eth');
            showToast('Address copied to clipboard');
            setTimeout(() => setCopyState(null), 2000);
        } catch {
            showToast('Copy failed');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setTxError('');

        if (activeNetwork === 'ARG' && !ArgusSynapseService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid Argus address. Must start with "arg..."'); return;
        }
        if (activeNetwork === 'ETH' && !EthereumService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid Ethereum address. Must start with "0x..."'); return;
        }
        if (txForm.recipient.toLowerCase() === (activeNetwork === 'ARG' ? addresses.arg : addresses.eth).toLowerCase()) {
            setTxError('Cannot transfer to yourself.'); return;
        }
        const amt = parseFloat(txForm.amount);
        if (isNaN(amt) || amt <= 0) {
            setTxError('Enter a valid amount > 0'); return;
        }
        const requiredTotal = activeNetwork === 'ARG' ? amt + GAS_FEE_ARG : amt;
        if (activeNetwork === 'ARG' && balance.arg < requiredTotal) {
            setTxError(`Insufficient funds. Need ${requiredTotal.toFixed(4)} ARG (incl. gas).`); return;
        }
        if (activeNetwork === 'ETH' && parseFloat(balance.eth) < amt) {
            setTxError('Insufficient ETH balance.'); return;
        }

        setIsProcessing(true);
        try {
            const txHash = '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18);

            if (activeNetwork === 'ARG') {
                const result = await transferARG({
                    senderUid: user!.uid,
                    senderArgAddress: addresses.arg,
                    recipientArgAddress: txForm.recipient,
                    amount: amt,
                    gasFee: GAS_FEE_ARG,
                    txHash,
                });
                if (!result.success) {
                    setTxError(result.error || 'Transfer failed.'); return;
                }
            } else {
                const { addDoc: firestoreAddDoc } = await import('firebase/firestore');
                await firestoreAddDoc(collection(db, 'wallet_transactions'), {
                    uid: user!.uid,
                    fromUid: user!.uid,
                    toUid: null,
                    chain: 'ETH',
                    type: 'SEND',
                    amount: String(amt),
                    from: addresses.eth,
                    to: txForm.recipient,
                    status: 'CONFIRMED',
                    txHash,
                    createdAt: Date.now(),
                    participants: [addresses.eth, txForm.recipient],
                    gasFee: 0,
                });
            }

            setTxForm({ recipient: '', amount: '' });
            showToast('Transaction broadcast successfully ✓');
            setActiveModal(null);
            setActiveTab('ACTIVITY');
        } catch {
            setTxError('Broadcast failed. Try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Derived Display Values
    const currentAddress = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
    const truncatedAddress = currentAddress ? `${currentAddress.slice(0, 8)}...${currentAddress.slice(-6)}` : 'Loading...';

    const displayBalanceData = activeNetwork === 'ARG'
        ? { amount: balance.arg, symbol: 'ARG', usdPrice: tokenPrices.arg.priceUsd, decimals: 2 }
        : { amount: parseFloat(balance.eth), symbol: 'ETH', usdPrice: tokenPrices.eth.priceUsd, decimals: 4 };

    const totalUsdValue = (displayBalanceData.amount * displayBalanceData.usdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const networkTxHistory = txHistory.filter(tx => tx.chain === activeNetwork);

    // ────────────────────────────────────────────────────────────────────────
    //  RENDER
    // ────────────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col items-center justify-start min-h-[100dvh] sm:py-8 px-0 sm:px-4 lg:py-12 bg-zinc-950/20 w-full relative">
            <Toast msg={toast.msg} visible={toast.visible} />

            {/* ── Main Card: mobile=1-col, lg=2-col ── */}
            <div className="
                w-full
                sm:max-w-[440px] lg:max-w-[900px]
                bg-zinc-950
                sm:border border-zinc-900
                rounded-none sm:rounded-[2rem]
                shadow-2xl shadow-black/60
                relative
                flex flex-col lg:flex-row
                min-h-[100dvh] sm:min-h-0
                sm:h-[750px]
                overflow-hidden
            ">
                {/* Ambient glow */}
                <div className={`absolute -top-40 left-1/4 w-80 h-80 rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${activeNetwork === 'ARG' ? 'bg-maroon/20' : 'bg-blue-500/10'
                    }`} />

                {/* ════════════════════════════
                    LEFT PANE — Balance & Actions
                    ════════════════════════════ */}
                <div className="relative flex flex-col w-full lg:w-[380px] shrink-0 lg:border-r border-zinc-900 z-10 lg:h-full">

                    {/* Network Header */}
                    <div className="flex justify-between items-center px-5 py-4 border-b border-zinc-900/60 bg-zinc-950/90 shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                                className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800 rounded-full border border-zinc-800 transition-colors"
                            >
                                {activeNetwork === 'ARG' ? (
                                    <><ArgusLogo className="w-4 h-4 text-maroon" /><span className="text-xs font-bold text-white tracking-wide">Argus GhostDAG</span></>
                                ) : (
                                    <><EthLogo className="w-4 h-4 text-blue-400" /><span className="text-xs font-bold text-white tracking-wide">Ethereum Mainnet</span></>
                                )}
                                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                            </button>

                            {isNetworkDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNetworkDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                                        {[
                                            { id: 'ARG', label: 'Argus GhostDAG', icon: <ArgusLogo className="w-5 h-5 text-maroon" /> },
                                            { id: 'ETH', label: 'Ethereum Mainnet', icon: <EthLogo className="w-5 h-5 text-blue-400" /> },
                                        ].map(n => (
                                            <button
                                                key={n.id}
                                                onClick={() => { setActiveNetwork(n.id as 'ARG' | 'ETH'); setIsNetworkDropdownOpen(false); }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/80 transition-colors text-left ${activeNetwork === n.id ? 'bg-zinc-800/50' : ''}`}
                                            >
                                                {n.icon}
                                                <span className="text-xs font-bold tracking-widest text-white">{n.label}</span>
                                                {activeNetwork === n.id && <Check className="w-3.5 h-3.5 text-maroon ml-auto" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Refresh + Identicon row */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setRefreshTrigger(r => r + 1)}
                                className="p-2 rounded-full text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                                title="Refresh balances"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <div className="w-8 h-8 rounded-full border border-zinc-800 bg-gradient-to-br from-zinc-700 to-zinc-900 overflow-hidden">
                                <div className="w-full h-full opacity-40" style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)`
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Scrollable left content */}
                    <div className="flex-1 lg:overflow-y-auto custom-scrollbar flex flex-col">

                        {/* Address Pill */}
                        <div className="flex justify-center pt-7 pb-1">
                            <button
                                onClick={copyAddress}
                                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-full transition-all group"
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-blue-400'}`} />
                                <span className="text-[11px] font-mono font-medium text-zinc-300">{truncatedAddress}</span>
                                {copyState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 transition-colors" />}
                            </button>
                        </div>

                        {/* Balance Hero */}
                        <div className="text-center mt-7 mb-9 px-6">
                            {isRefreshing ? (
                                <div className="flex justify-center py-6">
                                    <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">Total Balance</p>
                                    <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                                        ${totalUsdValue}
                                    </h1>
                                    <p className="text-zinc-500 text-sm mt-3 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        <span className="font-bold text-zinc-300">
                                            {displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })}
                                        </span>
                                        {displayBalanceData.symbol}
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex justify-center gap-6 mb-8 px-6">
                            {[
                                { label: 'Buy', modal: 'BUY', icon: <CreditCard className="w-5 h-5" />, cls: 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20 text-white', textCls: 'text-blue-400' },
                                { label: 'Send', modal: 'SEND', icon: <ArrowUpRight className="w-5 h-5" />, cls: 'bg-zinc-800 hover:bg-zinc-700 shadow-black/20 text-white', textCls: 'text-zinc-300' },
                                { label: 'Swap', modal: 'SWAP', icon: <Repeat className="w-5 h-5" />, cls: 'bg-zinc-800 hover:bg-zinc-700 shadow-black/20 text-white', textCls: 'text-zinc-300' },
                                { label: 'Receive', modal: 'RECEIVE', icon: <ArrowDownLeft className="w-5 h-5" />, cls: 'bg-zinc-800 hover:bg-zinc-700 shadow-black/20 text-white', textCls: 'text-zinc-300' },
                            ].map(a => (
                                <div key={a.label} className="flex flex-col items-center gap-2">
                                    <button
                                        onClick={() => setActiveModal(a.modal as any)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${a.cls}`}
                                    >
                                        {a.icon}
                                    </button>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${a.textCls}`}>{a.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* ── Desktop: Tokens mini-list pinned to left pane ── */}
                        <div className="hidden lg:block border-t border-zinc-900 mt-auto">
                            <div className="px-5 py-4 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Holdings</span>
                                <span className="text-[10px] text-zinc-700 font-mono">1 asset</span>
                            </div>
                            <div
                                className="flex items-center justify-between px-5 pb-5 cursor-pointer hover:bg-zinc-900/30 transition-colors"
                                onClick={() => setActiveModal('RECEIVE')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-white'}`}>
                                        {activeNetwork === 'ARG' ? <ArgusLogo className="w-4 h-4 text-white" /> : <EthLogo className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-sm">{activeNetwork === 'ARG' ? 'Argus' : 'Ethereum'}</p>
                                        <p className="text-[10px] text-zinc-500 font-mono">{displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })} {displayBalanceData.symbol}</p>
                                    </div>
                                </div>
                                <p className="text-white font-bold text-sm">${totalUsdValue}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════
                    RIGHT PANE — Tokens & Activity
                    ════════════════════════════ */}
                <div className="relative flex flex-col flex-1 z-10 overflow-hidden lg:border-t-0 border-t border-zinc-900 bg-zinc-950/20">

                    {/* Tabs */}
                    <div className="flex border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md shrink-0">
                        {(['TOKENS', 'ACTIVITY'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className={`absolute bottom-0 left-0 w-full h-0.5 ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-blue-500'}`} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pb-10 lg:pb-0">

                        {/* ── TOKENS TAB ── */}
                        {activeTab === 'TOKENS' && (
                            <div>
                                {/* Mobile: show token row here; Desktop: already shown in left pane mini-list */}
                                <div className="lg:hidden flex items-center justify-between p-5 hover:bg-zinc-900/30 transition-colors cursor-pointer border-b border-zinc-900/50" onClick={() => setActiveModal('RECEIVE')}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-white'}`}>
                                            {activeNetwork === 'ARG' ? <ArgusLogo className="w-5 h-5 text-white" /> : <EthLogo className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{activeNetwork === 'ARG' ? 'Argus' : 'Ethereum'}</p>
                                            <p className="text-xs text-zinc-500">{displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })} {displayBalanceData.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-sm">${totalUsdValue}</p>
                                    </div>
                                </div>

                                {/* Desktop: extended token details */}
                                <div className="p-6 space-y-4">
                                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Network</p>
                                            <div className="flex items-center gap-2">
                                                {activeNetwork === 'ARG' ? <ArgusLogo className="w-3.5 h-3.5 text-maroon" /> : <EthLogo className="w-3.5 h-3.5 text-blue-400" />}
                                                <span className="text-xs font-bold text-white">{activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Balance</p>
                                            <p className="text-xs font-bold text-white font-mono">{displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })} {displayBalanceData.symbol}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">USD Value</p>
                                            <p className="text-xs font-bold text-white">${totalUsdValue}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Price</p>
                                            <p className="text-xs font-bold text-white">${displayBalanceData.usdPrice.toFixed(4)}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Your Address</p>
                                            <button onClick={copyAddress} className="text-[10px] font-mono text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                                                {truncatedAddress}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-center text-[10px] text-zinc-700 font-bold uppercase tracking-widest">More tokens coming with mainnet launch</p>
                                </div>
                            </div>
                        )}

                        {/* ── ACTIVITY TAB ── */}
                        {activeTab === 'ACTIVITY' && (
                            <div className="divide-y divide-zinc-900/50">
                                {networkTxHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                        <History className="w-10 h-10 text-zinc-800 mb-4" />
                                        <p className="text-sm font-bold text-white mb-1">No transactions yet</p>
                                        <p className="text-xs text-zinc-500">Transfers on {activeNetwork === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet'} will appear here.</p>
                                    </div>
                                ) : (
                                    networkTxHistory.map(tx => {
                                        const isSent = tx.from === (tx.chain === 'ARG' ? addresses.arg : addresses.eth);
                                        return (
                                            <div
                                                key={tx.id}
                                                onClick={() => { setSelectedTx(tx); setActiveModal('TX_DETAIL'); }}
                                                className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-700 transition-colors">
                                                        {isSent
                                                            ? <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                                                            : <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">
                                                            {isSent ? 'Sent' : 'Received'} {tx.chain}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <StatusBadge status={tx.status} />
                                                            <span className="text-[9px] text-zinc-600 font-mono">
                                                                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${isSent ? 'text-white' : 'text-emerald-400'}`}>
                                                        {isSent ? '−' : '+'}{Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.chain}
                                                    </p>
                                                    {tx.gasFee > 0 && (
                                                        <p className="text-[9px] text-zinc-600 mt-0.5 font-mono">Gas: {tx.gasFee} ARG</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════
                MODALS OVERLAY SYSTEM
                ══════════════════════════ */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
                    <div className="relative w-full sm:max-w-[420px] bg-zinc-900 sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
                            <h2 className="text-xs font-black text-white uppercase tracking-widest">
                                {activeModal === 'SEND' && `Send ${activeNetwork}`}
                                {activeModal === 'RECEIVE' && `Receive ${activeNetwork}`}
                                {activeModal === 'SWAP' && 'Swap Tokens'}
                                {activeModal === 'BUY' && 'Buy Crypto'}
                                {activeModal === 'TX_DETAIL' && 'Transaction Details'}
                            </h2>
                            <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                            {/* ── SEND ── */}
                            {activeModal === 'SEND' && (
                                <form onSubmit={handleSend} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recipient Address</label>
                                        <input
                                            required autoFocus
                                            value={txForm.recipient}
                                            onChange={e => { setTxForm({ ...txForm, recipient: e.target.value }); setTxError(''); }}
                                            placeholder={activeNetwork === 'ARG' ? 'arg1...' : '0x...'}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white py-3 px-4 rounded-xl focus:border-maroon outline-none font-mono text-xs placeholder:text-zinc-700 transition-all"
                                        />
                                    </div>

                                    {/* Asset selector (display-only) */}
                                    <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl opacity-80">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-white'}`}>
                                            {activeNetwork === 'ARG' ? <ArgusLogo className="w-4 h-4 text-white" /> : <EthLogo className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">{activeNetwork}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">Balance: {displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between">
                                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Amount</label>
                                            <button type="button" onClick={() => setTxForm({ ...txForm, amount: String(Math.max(0, displayBalanceData.amount - GAS_FEE_ARG)) })} className="text-[10px] text-maroon hover:underline font-bold">MAX</button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                required type="number" step="any" min="0"
                                                value={txForm.amount}
                                                onChange={e => { setTxForm({ ...txForm, amount: e.target.value }); setTxError(''); }}
                                                placeholder="0.00"
                                                className="w-full bg-zinc-950 border border-zinc-800 text-white py-4 px-4 pr-16 rounded-xl focus:border-maroon outline-none text-2xl font-black placeholder:text-zinc-700 transition-all text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{activeNetwork}</span>
                                        </div>
                                    </div>

                                    {activeNetwork === 'ARG' && (
                                        <div className="flex justify-between p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/50">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Gas Fee</span>
                                            <span className="text-xs font-bold text-zinc-300">0.001 ARG</span>
                                        </div>
                                    )}

                                    {txError && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                            <p className="text-[10px] text-red-400 font-medium">{txError}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit" disabled={isProcessing}
                                        className="w-full py-4 bg-maroon text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-2"
                                    >
                                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Confirm & Send'}
                                    </button>
                                </form>
                            )}

                            {/* ── RECEIVE ── */}
                            {activeModal === 'RECEIVE' && (
                                <div className="flex flex-col items-center gap-5">
                                    <div className="p-4 bg-white rounded-3xl w-44 h-44 shrink-0">
                                        <QRCode data={currentAddress} />
                                    </div>
                                    <div className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:border-zinc-700 transition-colors group" onClick={copyAddress}>
                                        <p className="text-xs font-mono text-zinc-300 break-all text-center leading-relaxed">{currentAddress}</p>
                                        <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-maroon transition-colors">
                                            {copyState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            {copyState ? 'Copied!' : 'Copy Address'}
                                        </div>
                                    </div>
                                    <p className="text-center text-[10px] text-zinc-600 leading-relaxed">
                                        Only send <strong className="text-zinc-400">{activeNetwork}</strong> to this address.
                                    </p>
                                </div>
                            )}

                            {/* ── SWAP / BUY (Mocked) ── */}
                            {(activeModal === 'SWAP' || activeModal === 'BUY') && (
                                <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                                    <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center">
                                        {activeModal === 'SWAP' ? <Repeat className="w-7 h-7 text-zinc-500" /> : <CreditCard className="w-7 h-7 text-zinc-500" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-white mb-1">{activeModal === 'SWAP' ? 'DEX Audit Underway' : 'On-Ramp Coming Soon'}</h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed max-w-[260px]">
                                            {activeModal === 'SWAP'
                                                ? 'The Argus DEX swap module is undergoing its final security audit. Available at mainnet launch.'
                                                : 'Fiat on-ramp integrations are being finalized. Check back after TGE.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ── TX DETAIL ── */}
                            {activeModal === 'TX_DETAIL' && selectedTx && (
                                <div className="space-y-5">
                                    {/* Amount Hero */}
                                    <div className="text-center pb-5 border-b border-zinc-800">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Amount</p>
                                        <p className="text-4xl font-black text-white">
                                            {Number(selectedTx.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                            <span className="text-sm text-zinc-500 ml-2">{selectedTx.chain}</span>
                                        </p>
                                        <div className="mt-3 flex justify-center">
                                            <StatusBadge status={selectedTx.status} />
                                        </div>
                                    </div>

                                    {/* Detail rows */}
                                    {[
                                        { label: 'Date', value: new Date(selectedTx.createdAt).toLocaleString() },
                                        { label: 'Network', value: selectedTx.chain === 'ARG' ? 'Argus GhostDAG' : 'Ethereum Mainnet' },
                                        { label: 'Type', value: selectedTx.type || 'TRANSFER' },
                                    ].map(row => (
                                        <div key={row.label} className="flex justify-between items-start gap-4 text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">{row.label}</span>
                                            <span className="text-zinc-200 text-right">{row.value}</span>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-start gap-4 text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">From</span>
                                        <div className="flex items-center gap-1.5 text-right min-w-0">
                                            <span className="text-zinc-300 font-mono break-all text-[10px]">{selectedTx.from}</span>
                                            <button onClick={() => navigator.clipboard.writeText(selectedTx.from)} className="shrink-0"><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-400" /></button>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-start gap-4 text-xs">
                                        <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">To</span>
                                        <div className="flex items-center gap-1.5 text-right min-w-0">
                                            <span className="text-zinc-300 font-mono break-all text-[10px]">{selectedTx.to}</span>
                                            <button onClick={() => navigator.clipboard.writeText(selectedTx.to)} className="shrink-0"><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-400" /></button>
                                        </div>
                                    </div>

                                    {selectedTx.gasFee > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider">Gas Fee</span>
                                            <span className="text-zinc-300 font-mono">{selectedTx.gasFee} ARG</span>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-zinc-800/60">
                                        <div className="flex justify-between items-start gap-4 text-xs">
                                            <span className="text-zinc-500 font-bold uppercase tracking-wider shrink-0">Tx Hash</span>
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-zinc-500 font-mono break-all text-[10px]">{selectedTx.txHash}</span>
                                                <button onClick={() => navigator.clipboard.writeText(selectedTx.txHash)} className="shrink-0"><Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-400" /></button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View on ArgusScan */}
                                    <div className="pt-2">
                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-600 cursor-default">
                                            <ExternalLink className="w-3 h-3" />
                                            <span>Recorded on Argus GhostDAG Ledger</span>
                                        </div>
                                    </div>
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
