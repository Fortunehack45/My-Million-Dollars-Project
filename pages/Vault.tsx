
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import {
    db,
} from '../services/firebase';
import { useTokenPrices } from '../services/TokenPriceService';
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs,
} from 'firebase/firestore';
import {
    ShieldCheck,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    Copy,
    Check,
    RefreshCcw,
    Loader2,
    SendHorizonal,
    DownloadCloud,
    Zap,
    CircleDollarSign,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    X,
} from 'lucide-react';
import { ArgusLogo } from '../components/ArgusLogo';
import { EthLogo } from '../components/EthLogo';

// ─── Types ────────────────────────────────────────────
import { WalletTx } from '../types';

export const GAS_FEE_ARG = 0.001;

// ─── QR Code SVG Simulation ───────────────────────────
const QRCode = ({ data }: { data: string }) => {
    // Deterministic pixel grid from input string
    const size = 9;
    const hash = data.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const cells: boolean[] = [];
    for (let i = 0; i < size * size; i++) {
        cells.push(((hash * (i + 7) * 13) % 100) > 42);
    }
    // Force corners to be filled (quiet zone markers)
    [0, 1, 2, 18, 19, 20, 6, 15, 60, 61, 62, 78, 79, 80].forEach(i => cells[i] = true);

    return (
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
            <rect width={size} height={size} fill="white" />
            {cells.map((on, i) =>
                on ? (
                    <rect
                        key={i}
                        x={i % size}
                        y={Math.floor(i / size)}
                        width={1}
                        height={1}
                        fill="#0f0f0f"
                    />
                ) : null
            )}
        </svg>
    );
};

// ─── Toast ────────────────────────────────────────────
const Toast = ({ msg, visible }: { msg: string; visible: boolean }) => (
    <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
    >
        <Check className="w-4 h-4 text-maroon" />
        <span className="text-xs font-bold text-white tracking-wider">{msg}</span>
    </div>
);

// ─── Chain Tab ────────────────────────────────────────
const ChainTab = ({
    chain,
    active,
    onClick,
}: {
    chain: 'ARG' | 'ETH';
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 ${active
            ? chain === 'ARG'
                ? 'bg-maroon text-white shadow-lg shadow-maroon/30'
                : 'bg-white text-zinc-950 shadow-lg shadow-white/20'
            : 'text-zinc-500 hover:text-zinc-300'
            }`}
    >
        {chain === 'ARG' ? (
            <ArgusLogo className="w-4 h-4 text-white" />
        ) : (
            <EthLogo className="w-4 h-4" />
        )}
        {chain}
    </button>
);

// ─── Nav Item ─────────────────────────────────────────
const NavItem = ({
    id,
    label,
    Icon,
    active,
    onClick,
}: {
    id: string;
    label: string;
    Icon: any;
    active: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-300 group ${active
            ? 'bg-zinc-900 border border-zinc-800 shadow-xl text-white'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'
            }`}
    >
        <Icon
            className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${active ? 'text-maroon scale-110' : 'group-hover:scale-110'
                }`}
        />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        {active && (
            <span className="ml-auto w-1.5 h-1.5 bg-maroon rounded-full animate-pulse" />
        )}
    </button>
);

// ─── Main Component ───────────────────────────────────
const Vault = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SEND' | 'RECEIVE' | 'HISTORY'>('OVERVIEW');
    const [activeChain, setActiveChain] = useState<'ARG' | 'ETH'>('ARG');
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [balance, setBalance] = useState({ arg: 0, eth: '0.00' });
    const [txHistory, setTxHistory] = useState<WalletTx[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });
    const [txError, setTxError] = useState('');
    const [copyState, setCopyState] = useState<'arg' | 'eth' | null>(null);
    const [toast, setToast] = useState({ msg: '', visible: false });
    const [selectedTx, setSelectedTx] = useState<WalletTx | null>(null);

    // Live token prices & market data
    const tokenPrices = useTokenPrices();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const refreshBalances = () => setRefreshTrigger(prev => prev + 1);

    // Deterministic address derivation
    useEffect(() => {
        if (user?.uid) {
            const arg = ArgusSynapseService.generateAddress(user.uid);
            const eth = EthereumService.generateAddress(user.uid);
            setAddresses({ arg, eth });
        }
    }, [user?.uid]);

    // Fetch ETH exclusively
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

    // Subscribe to bidirectional global tx history for this user
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

    // Compute genuine real-time ARG balance natively
    useEffect(() => {
        if (!user || !addresses.arg) return;
        let argNet = 0;
        txHistory.forEach(tx => {
            if (tx.chain !== 'ARG' || tx.status !== 'CONFIRMED') return;
            const amt = parseFloat(tx.amount);
            if (tx.from === addresses.arg) argNet -= (amt + (tx.gasFee || 0));
            // Only add if explicitly received and not self-transfer (though self is blocked)
            else if (tx.to === addresses.arg) argNet += amt;
        });
        const genuineArg = (user.points || 0) + argNet;
        setBalance(prev => ({ ...prev, arg: Math.max(0, genuineArg) }));
    }, [user?.points, addresses.arg, txHistory]);

    const showToast = (msg: string) => {
        setToast({ msg, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
    };

    const copyAddress = async (type: 'arg' | 'eth') => {
        const addr = type === 'arg' ? addresses.arg : addresses.eth;
        try {
            await navigator.clipboard.writeText(addr);
            setCopyState(type);
            showToast('Address copied to clipboard');
            setTimeout(() => setCopyState(null), 2000);
        } catch {
            showToast('Copy failed — please copy manually');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setTxError('');

        // Validate
        if (activeChain === 'ARG' && !ArgusSynapseService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid Argus address. Must start with "arg..."');
            return;
        }
        if (activeChain === 'ETH' && !EthereumService.isValidAddress(txForm.recipient)) {
            setTxError('Invalid Ethereum address. Must start with "0x..."');
            return;
        }
        if (txForm.recipient.toLowerCase() === (activeChain === 'ARG' ? addresses.arg : addresses.eth).toLowerCase()) {
            setTxError('You cannot transfer assets to yourself.');
            return;
        }

        const amt = parseFloat(txForm.amount);
        const requiredTotal = activeChain === 'ARG' ? amt + GAS_FEE_ARG : amt;

        if (isNaN(amt) || amt <= 0) {
            setTxError('Enter a valid amount greater than 0');
            return;
        }

        if (activeChain === 'ARG' && balance.arg < requiredTotal) {
            setTxError(`Insufficient funds. You need ${requiredTotal} ARG (including ${GAS_FEE_ARG} ARG gas fee).`);
            return;
        }

        if (activeChain === 'ETH' && parseFloat(balance.eth) < amt) {
            setTxError(`Insufficient funds for ETH transfer.`);
            return;
        }

        setIsProcessing(true);
        try {
            // Find recipient UID if they exist in our system
            let toUid = '';
            try {
                const userSnap = await getDocs(query(
                    collection(db, 'users'),
                    where(activeChain === 'ARG' ? 'argAddress' : 'ethAddress', '==', txForm.recipient)
                ));
                if (!userSnap.empty) toUid = userSnap.docs[0].id;
            } catch (e) { /* silent fail for external addresses */ }

            const txHash = '0x' + Math.random().toString(16).slice(2, 18) + Math.random().toString(16).slice(2, 18);
            const fromAddr = activeChain === 'ARG' ? addresses.arg : addresses.eth;
            const toAddr = txForm.recipient;

            const tx: Omit<WalletTx, 'id'> = {
                fromUid: user!.uid,
                toUid: toUid || undefined,
                chain: activeChain,
                type: 'SEND',
                amount: txForm.amount,
                to: toAddr,
                from: fromAddr,
                status: 'CONFIRMED',
                txHash,
                createdAt: Date.now(),
                participants: [fromAddr, toAddr],
                gasFee: activeChain === 'ARG' ? GAS_FEE_ARG : 0,
            };
            await addDoc(collection(db, 'wallet_transactions'), tx);
            setTxForm({ recipient: '', amount: '' });
            showToast('Transaction broadcast successfully');
            setActiveTab('HISTORY');
        } catch (err) {
            setTxError('Broadcast failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // ─── ARG USD value ──
    const argUsd = (balance.arg * tokenPrices.arg.priceUsd).toFixed(2);
    const ethProviderReady = EthereumService.isProviderConfigured();

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Toast msg={toast.msg} visible={toast.visible} />

            {/* ── Infura not configured notice ─────────── */}
            {!ethProviderReady && (
                <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">ETH Live Balance — Setup Required</p>
                        <p className="text-[9px] text-amber-400/70 leading-relaxed">
                            Set <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">VITE_INFURA_API_KEY</code> in your <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">.env</code> file to fetch real Ethereum mainnet balances.
                            Get a free key at{' '}
                            <a href="https://infura.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-300">infura.io</a>.
                            ARG balance is always live via Argus Protocol.
                        </p>
                    </div>
                </div>
            )}

            <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-maroon/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-maroon/5 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-8 md:p-12">
                    <div className="flex flex-col xl:flex-row justify-between gap-8">
                        {/* Left: Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-maroon/10 border border-maroon/20 rounded-2xl">
                                    <ShieldCheck className="w-5 h-5 text-maroon" />
                                </div>
                                <div>
                                    <h1 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">
                                        Operator Vault
                                    </h1>
                                    <p className="text-[8px] text-maroon font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                                        <span className="w-1.5 h-1.5 bg-maroon rounded-full animate-pulse" />
                                        GhostDAG · Synced
                                    </p>
                                </div>
                            </div>

                            {/* Balance */}
                            <div>
                                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-2">
                                    {activeChain === 'ARG' ? 'ARG Balance' : 'ETH Balance'}
                                </p>
                                {isRefreshing ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-5 h-5 text-maroon animate-spin" />
                                        <span className="text-zinc-600 text-sm font-mono">Syncing…</span>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
                                            {activeChain === 'ARG'
                                                ? `${(user?.points || balance.arg).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                : balance.eth}
                                            <span className="text-base ml-2 text-zinc-500">{activeChain}</span>
                                        </p>
                                        {activeChain === 'ARG' && (
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="text-zinc-500 text-sm font-medium">≈ ${argUsd} USD</span>
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded-full">
                                                    <TrendingUp className="w-3 h-3" />+4.2%
                                                </span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-3 flex-wrap">
                                <button
                                    onClick={() => setActiveTab('SEND')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-maroon text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-maroon/20"
                                >
                                    <SendHorizonal className="w-3.5 h-3.5" />
                                    Send
                                </button>
                                <button
                                    onClick={() => setActiveTab('RECEIVE')}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all"
                                >
                                    <DownloadCloud className="w-3.5 h-3.5" />
                                    Receive
                                </button>
                                <button
                                    onClick={refreshBalances}
                                    disabled={isRefreshing}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-zinc-800 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all"
                                >
                                    <RefreshCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-maroon' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Right: Chain Selector + Stats */}
                        <div className="flex flex-col gap-4 xl:items-end">
                            <div className="flex gap-1.5 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                                <ChainTab chain="ARG" active={activeChain === 'ARG'} onClick={() => setActiveChain('ARG')} />
                                <ChainTab chain="ETH" active={activeChain === 'ETH'} onClick={() => setActiveChain('ETH')} />
                            </div>

                            {/* Truncated address pill */}
                            <div
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors group"
                                onClick={() => copyAddress(activeChain === 'ARG' ? 'arg' : 'eth')}
                            >
                                <span className="text-[9px] font-mono text-zinc-400 tracking-wider">
                                    {activeChain === 'ARG'
                                        ? `${addresses.arg.slice(0, 10)}...${addresses.arg.slice(-6)}`
                                        : `${addresses.eth.slice(0, 8)}...${addresses.eth.slice(-6)}`}
                                </span>
                                {copyState === (activeChain === 'ARG' ? 'arg' : 'eth') ? (
                                    <Check className="w-3 h-3 text-maroon" />
                                ) : (
                                    <Copy className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                )}
                            </div>

                            {/* Mini stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Transactions</p>
                                    <p className="text-xl font-black text-white">{txHistory.length}</p>
                                </div>
                                <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-2xl">
                                    <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Network</p>
                                    <p className="text-xl font-black text-maroon">GhostDAG</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content Layout ──────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Sidebar Nav */}
                <div className="lg:col-span-3 space-y-1">
                    {[
                        { id: 'OVERVIEW', label: 'Overview', Icon: Zap },
                        { id: 'SEND', label: 'Send', Icon: ArrowUpRight },
                        { id: 'RECEIVE', label: 'Receive', Icon: ArrowDownLeft },
                        { id: 'HISTORY', label: 'History', Icon: History },
                    ].map(item => (
                        <NavItem
                            key={item.id}
                            id={item.id}
                            label={item.label}
                            Icon={item.Icon}
                            active={activeTab === item.id}
                            onClick={() => setActiveTab(item.id as any)}
                        />
                    ))}

                    {/* Security note */}
                    <div className="mt-6 p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Security</p>
                        <p className="text-[9px] text-zinc-600 leading-relaxed">
                            Your keys are derived deterministically. No private keys are stored on our servers.
                        </p>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="lg:col-span-9 bg-zinc-950/50 border border-zinc-900 rounded-[2rem] p-8 md:p-10 relative overflow-hidden min-h-[480px]">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-maroon/20 to-transparent" />

                    {/* ── OVERVIEW ── */}
                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Asset Overview</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Multi-chain balance sheet</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ARG Card */}
                                <div className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-maroon/40 hover:bg-maroon/5 transition-all duration-500 cursor-pointer" onClick={() => setActiveChain('ARG')}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center">
                                            <ArgusLogo className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2 py-0.5 bg-zinc-950 text-zinc-600 text-[8px] font-mono rounded border border-zinc-800">GhostDAG</span>
                                            <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${tokenPrices.arg.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {tokenPrices.arg.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                                {tokenPrices.arg.change24h >= 0 ? '+' : ''}{tokenPrices.arg.change24h}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Argus Protocol</p>
                                    <p className="text-3xl font-black text-white">
                                        {(user?.points || balance.arg).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        <span className="text-xs text-zinc-500 ml-1">ARG</span>
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">≈ ${argUsd} USD</p>
                                </div>

                                {/* ETH Card */}
                                <div className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-white/20 hover:bg-white/5 transition-all duration-500 cursor-pointer" onClick={() => setActiveChain('ETH')}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                            <EthLogo className="w-6 h-6" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2 py-0.5 bg-zinc-950 text-zinc-600 text-[8px] font-mono rounded border border-zinc-800">Ethereum</span>
                                            {tokenPrices.eth.priceUsd > 0 && (
                                                <span className={`flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black rounded uppercase ${tokenPrices.eth.change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {tokenPrices.eth.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                                    {tokenPrices.eth.change24h >= 0 ? '+' : ''}{tokenPrices.eth.change24h}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Ether</p>
                                    <p className="text-3xl font-black text-white">
                                        {balance.eth}
                                        <span className="text-xs text-zinc-500 ml-1">ETH</span>
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">≈ ${(parseFloat(balance.eth) * tokenPrices.eth.priceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>

                                </div>
                            </div>

                            {/* Recent activity preview */}
                            {txHistory.length > 0 && (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recent Activity</p>
                                        <button onClick={() => setActiveTab('HISTORY')} className="text-[9px] text-maroon font-bold uppercase hover:underline">View All</button>
                                    </div>
                                    <div className="space-y-2">
                                        {txHistory.slice(0, 3).map(tx => {
                                            const isSent = tx.from === (tx.chain === 'ARG' ? addresses.arg : addresses.eth);
                                            const typeLabel = isSent ? 'SEND' : 'RECEIVE';
                                            return (
                                                <div
                                                    key={tx.id}
                                                    onClick={() => setSelectedTx(tx)}
                                                    className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl cursor-pointer hover:bg-zinc-900/50 hover:border-zinc-800 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl flex items-center justify-center ${isSent ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                            {tx.chain === 'ARG' ? <ArgusLogo className="w-3.5 h-3.5" /> : <EthLogo className="w-3.5 h-3.5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold text-white uppercase">{typeLabel} · {tx.chain}</p>
                                                            <p className="text-[8px] text-zinc-600 font-mono">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <p className={`text-sm font-black ${isSent ? 'text-zinc-300' : 'text-maroon'}`}>
                                                        {isSent ? '−' : '+'}{tx.amount} {tx.chain}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── SEND ── */}
                    {activeTab === 'SEND' && (
                        <div className="space-y-8 animate-in fade-in duration-500 max-w-lg mx-auto">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Send Assets</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Broadcast a signed transaction</p>
                            </div>

                            {/* Chain selector inline */}
                            <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit">
                                <ChainTab chain="ARG" active={activeChain === 'ARG'} onClick={() => setActiveChain('ARG')} />
                                <ChainTab chain="ETH" active={activeChain === 'ETH'} onClick={() => setActiveChain('ETH')} />
                            </div>

                            <form onSubmit={handleSend} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Recipient Address</label>
                                    <input
                                        required
                                        value={txForm.recipient}
                                        onChange={e => { setTxForm({ ...txForm, recipient: e.target.value }); setTxError(''); }}
                                        placeholder={activeChain === 'ARG' ? 'arg1...' : '0x...'}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 px-5 rounded-2xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none transition-all font-mono text-sm placeholder:text-zinc-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Amount</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={txForm.amount}
                                            onChange={e => { setTxForm({ ...txForm, amount: e.target.value }); setTxError(''); }}
                                            placeholder="0.00"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 px-5 pr-20 rounded-2xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none transition-all font-mono text-sm placeholder:text-zinc-700"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-500 uppercase">{activeChain}</span>
                                    </div>
                                </div>

                                {/* Fee notice */}
                                <div className="flex items-start gap-2 p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                                    <Zap className="w-3.5 h-3.5 text-maroon mt-0.5 flex-shrink-0" />
                                    <p className="text-[9px] text-zinc-500 leading-relaxed">
                                        Network fee: <span className="text-white font-bold">~0.001 {activeChain}</span> · Estimated confirmation in <span className="text-white font-bold">&lt;400ms</span> via GhostDAG.
                                    </p>
                                </div>

                                {txError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        <p className="text-[10px] text-red-400">{txError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-maroon text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 focus:ring-2 focus:ring-maroon/50 outline-none transition-all shadow-lg shadow-maroon/20 disabled:opacity-60 disabled:cursor-wait"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Broadcasting Transaction…
                                        </>
                                    ) : (
                                        <>
                                            <SendHorizonal className="w-4 h-4" />
                                            Broadcast Transaction
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* ── RECEIVE ── */}
                    {activeTab === 'RECEIVE' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Receive Assets</h2>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Share your address to receive funds</p>
                            </div>

                            {/* Chain selector */}
                            <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl w-fit">
                                <ChainTab chain="ARG" active={activeChain === 'ARG'} onClick={() => setActiveChain('ARG')} />
                                <ChainTab chain="ETH" active={activeChain === 'ETH'} onClick={() => setActiveChain('ETH')} />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* QR Code */}
                                <div className="flex-shrink-0">
                                    <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-maroon/10 w-44 h-44">
                                        <QRCode data={activeChain === 'ARG' ? addresses.arg : addresses.eth} />
                                    </div>
                                    <p className="text-center text-[9px] text-zinc-600 font-mono mt-3 uppercase tracking-widest">
                                        {activeChain} · Scan to Pay
                                    </p>
                                </div>

                                {/* Address details */}
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2">
                                            Your {activeChain === 'ARG' ? 'Argus Protocol' : 'Ethereum'} Address
                                        </p>
                                        <div className="relative p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl group">
                                            <p className="font-mono text-sm text-zinc-200 break-all leading-relaxed pr-10">
                                                {activeChain === 'ARG' ? addresses.arg : addresses.eth}
                                            </p>
                                            <button
                                                onClick={() => copyAddress(activeChain === 'ARG' ? 'arg' : 'eth')}
                                                className="absolute top-4 right-4 p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-500 hover:text-maroon hover:border-maroon/30 transition-all"
                                            >
                                                {copyState === (activeChain === 'ARG' ? 'arg' : 'eth')
                                                    ? <Check className="w-3.5 h-3.5 text-maroon" />
                                                    : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => copyAddress(activeChain === 'ARG' ? 'arg' : 'eth')}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 border border-zinc-800 text-zinc-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:border-maroon/40 hover:text-white transition-all"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                        Copy Full Address
                                    </button>

                                    <p className="text-[9px] text-zinc-600 leading-relaxed">
                                        Only send <span className="text-white font-bold">{activeChain}</span> assets to this address. Sending other tokens may result in permanent loss of funds.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── HISTORY ── */}
                    {activeTab === 'HISTORY' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Transaction History</h2>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">On-chain activity log</p>
                                </div>
                                <span className="text-[8px] font-mono font-bold text-maroon bg-maroon/10 px-3 py-1 rounded-full uppercase border border-maroon/20">
                                    {txHistory.length} TXs
                                </span>
                            </div>

                            <div className="space-y-2">
                                {txHistory.map(tx => {
                                    const isSent = tx.from === (tx.chain === 'ARG' ? addresses.arg : addresses.eth);
                                    const typeLabel = isSent ? 'SEND' : 'RECEIVE';
                                    return (
                                        <div
                                            key={tx.id}
                                            onClick={() => setSelectedTx(tx)}
                                            className="flex items-center justify-between p-5 bg-zinc-900/20 border border-zinc-900 rounded-2xl cursor-pointer hover:bg-zinc-900/40 hover:border-zinc-800 transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${isSent
                                                    ? 'bg-orange-500/5 border-orange-500/20 text-orange-400'
                                                    : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {isSent ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[10px] font-black text-white uppercase">{typeLabel} · {tx.chain}</span>
                                                        <span className="text-[8px] font-mono text-zinc-600">{tx.txHash.slice(0, 14)}…</span>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-600 mt-0.5">
                                                        {new Date(tx.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-sm font-black ${isSent ? 'text-zinc-200' : 'text-maroon'}`}>
                                                    {isSent ? '−' : '+'}{tx.amount} {tx.chain}
                                                </p>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${tx.status === 'CONFIRMED' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Transaction Detail Modal ── */}
            {selectedTx && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTx(null)} />
                    <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setSelectedTx(null)}
                            className="absolute top-6 right-6 p-2 bg-zinc-900 text-zinc-400 hover:text-white rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">Transaction Details</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Confirmed on GhostDAG</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/80 text-center">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-3xl font-black text-white">{selectedTx.amount} <span className="text-sm text-zinc-500 ml-1">{selectedTx.chain}</span></p>
                            </div>

                            <div className="space-y-4 text-sm mt-4">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Time</span>
                                    <span className="text-xs text-zinc-300">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</span>
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded text-emerald-400 bg-emerald-500/10">{selectedTx.status}</span>
                                </div>
                                <div className="py-2 border-b border-zinc-900 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">From</span>
                                    <span className="font-mono text-[10px] text-zinc-400 break-all">{selectedTx.from}</span>
                                </div>
                                <div className="py-2 border-b border-zinc-900 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">To</span>
                                    <span className="font-mono text-[10px] text-zinc-400 break-all">{selectedTx.to}</span>
                                </div>
                                <div className="py-2 border-b border-zinc-900 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Network Fee</span>
                                    <span className="font-mono text-xs text-white">{(selectedTx.chain === 'ARG' ? selectedTx.gasFee : 0)} {selectedTx.chain}</span>
                                </div>
                                <div className="py-2 space-y-1.5">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Transaction Hash</span>
                                    <span className="font-mono text-[10px] text-zinc-400 break-all">{selectedTx.txHash}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vault;
