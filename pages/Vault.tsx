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
    SendHorizonal,
    Zap,
    AlertCircle,
    X,
    ChevronDown,
    CreditCard,
    Repeat,
    History
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

// ─── Main Component: MetaMask Style ───────────────────
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

    // Subscribe to tx history for BOTH addresses
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

    // Sync ARG balance
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

        // Validation
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
        } catch (err) {
            setTxError('Broadcast failed. Try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    // Derived Display Values
    const currentAddress = activeNetwork === 'ARG' ? addresses.arg : addresses.eth;
    const truncatedAddress = currentAddress ? `${currentAddress.slice(0, 7)}...${currentAddress.slice(-5)}` : 'Loading...';
    
    // Network specific balance and USD
    const displayBalanceData = activeNetwork === 'ARG' 
        ? { amount: balance.arg, symbol: 'ARG', usdPrice: tokenPrices.arg.priceUsd, decimals: 2 }
        : { amount: parseFloat(balance.eth), symbol: 'ETH', usdPrice: tokenPrices.eth.priceUsd, decimals: 4 };

    const totalUsdValue = (displayBalanceData.amount * displayBalanceData.usdPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    // Filter history by active network
    const networkTxHistory = txHistory.filter(tx => tx.chain === activeNetwork);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen py-8 px-4 sm:px-0 bg-zinc-950/20 w-full">
            <Toast msg={toast.msg} visible={toast.visible} />

            {/* Main MetaMask-style Card */}
            <div className="w-full max-w-[440px] bg-zinc-950 border border-zinc-900 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col h-[750px] shadow-black/50">
                {/* Background glow based on network */}
                <div className={`absolute -top-[150px] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${
                    activeNetwork === 'ARG' ? 'bg-maroon/20' : 'bg-blue-500/10'
                }`} />

                {/* 1. Network Header */}
                <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-900/50 bg-zinc-950/80 z-10 relative">
                    {/* Network Switcher Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 hover:bg-zinc-900 rounded-full border border-zinc-800 transition-colors"
                        >
                            {activeNetwork === 'ARG' ? (
                                <><ArgusLogo className="w-4 h-4 text-maroon" /> <span className="text-xs font-bold text-white tracking-widest leading-none">Argus GhostDAG</span></>
                            ) : (
                                <><EthLogo className="w-4 h-4 text-blue-500" /> <span className="text-xs font-bold text-white tracking-widest leading-none">Ethereum Mainnet</span></>
                            )}
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {isNetworkDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsNetworkDropdownOpen(false)} />
                                <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                                    <button 
                                        onClick={() => { setActiveNetwork('ARG'); setIsNetworkDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                                    >
                                        <ArgusLogo className="w-5 h-5 text-maroon" />
                                        <div>
                                            <p className="text-xs font-bold tracking-widest text-white leading-tight">Argus GhostDAG</p>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => { setActiveNetwork('ETH'); setIsNetworkDropdownOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                                    >
                                        <EthLogo className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-xs font-bold tracking-widest text-white leading-tight">Ethereum Mainnet</p>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Identicon mock */}
                    <div className="w-8 h-8 rounded-full border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-900 overflow-hidden flex items-center justify-center">
                        <div className="w-full h-full opacity-50 distribute-patterns" style={{
                            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #fff 2px, #fff 4px)`
                        }}></div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto z-10 custom-scrollbar pb-10">
                    {/* 2. Account Pill */}
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={copyAddress}
                            className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-800/80 rounded-full transition-all group"
                        >
                            <span className="text-[11px] font-mono font-medium text-zinc-300">{truncatedAddress}</span>
                            {copyState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />}
                        </button>
                    </div>

                    {/* 3. Central Balance Hero */}
                    <div className="text-center mt-8 mb-10 px-6">
                        {isRefreshing ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-8 h-8 text-zinc-600 animate-spin" />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-6xl font-black text-white tracking-tighter tabular-nums leading-none">
                                    ${totalUsdValue}
                                </h1>
                                <p className="text-zinc-500 font-medium text-sm mt-3 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                    <span className="font-bold text-zinc-400">
                                        {displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })}
                                    </span>
                                    {displayBalanceData.symbol}
                                </p>
                            </>
                        )}
                    </div>

                    {/* 4. Quick Action Row */}
                    <div className="flex justify-center gap-6 mb-10 px-6">
                        {/* Buy */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => setActiveModal('BUY')} className="w-14 h-14 bg-blue-500 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20 text-white">
                                <CreditCard className="w-6 h-6" />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Buy</span>
                        </div>
                        {/* Send */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => setActiveModal('SEND')} className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20 text-white">
                                <ArrowUpRight className="w-6 h-6" />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Send</span>
                        </div>
                        {/* Swap */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => setActiveModal('SWAP')} className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20 text-white">
                                <Repeat className="w-6 h-6" />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Swap</span>
                        </div>
                        {/* Receive */}
                        <div className="flex flex-col items-center gap-2">
                            <button onClick={() => setActiveModal('RECEIVE')} className="w-14 h-14 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20 text-white">
                                <ArrowDownLeft className="w-6 h-6" />
                            </button>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Receive</span>
                        </div>
                    </div>

                    {/* 5. Tabs (Tokens | Activity) */}
                    <div className="flex border-b border-zinc-900 border-t bg-zinc-950/80 sticky top-0 z-10 backdrop-blur-md">
                        <button 
                            onClick={() => setActiveTab('TOKENS')}
                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'TOKENS' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            Tokens
                            {activeTab === 'TOKENS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-maroon" />}
                        </button>
                        <button 
                            onClick={() => setActiveTab('ACTIVITY')}
                            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors relative ${activeTab === 'ACTIVITY' ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            Activity
                            {activeTab === 'ACTIVITY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-maroon" />}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'TOKENS' && (
                            <div className="divide-y divide-zinc-900/50">
                                {/* Only show the asset for the active network */}
                                <div className="flex items-center justify-between p-5 hover:bg-zinc-900/30 transition-colors cursor-pointer" onClick={() => setActiveModal('RECEIVE')}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-white'}`}>
                                            {activeNetwork === 'ARG' ? <ArgusLogo className="w-5 h-5 text-white" /> : <EthLogo className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm tracking-wide">{activeNetwork === 'ARG' ? 'Argus' : 'Ethereum'}</p>
                                            <p className="text-xs text-zinc-500 font-medium">{displayBalanceData.amount.toLocaleString(undefined, { minimumFractionDigits: displayBalanceData.decimals })} {displayBalanceData.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold text-sm">${totalUsdValue}</p>
                                    </div>
                                </div>
                                <div className="p-8 text-center">
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                        Don't see your token?<br/>
                                        <a href="#" className="text-maroon hover:underline">Import tokens</a>
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ACTIVITY' && (
                            <div className="divide-y divide-zinc-900/50">
                                {networkTxHistory.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <History className="w-10 h-10 text-zinc-800 mb-4" />
                                        <p className="text-sm font-bold text-white mb-1">You have no transactions</p>
                                        <p className="text-xs text-zinc-500">Transfers on {activeNetwork} will appear here.</p>
                                    </div>
                                ) : (
                                    networkTxHistory.map(tx => {
                                        const isSent = tx.from === (tx.chain === 'ARG' ? addresses.arg : addresses.eth);
                                        const label = isSent ? 'Send' : 'Receive';
                                        return (
                                            <div 
                                                key={tx.id} 
                                                onClick={() => { setSelectedTx(tx); setActiveModal('TX_DETAIL'); }}
                                                className="flex items-center justify-between p-5 hover:bg-zinc-900/30 transition-colors cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                                                        isSent ? 'bg-zinc-900 border-zinc-700/50' : 'bg-zinc-900 border-zinc-700/50'
                                                    }`}>
                                                        {isSent ? <ArrowUpRight className="w-5 h-5 text-white" /> : <ArrowDownLeft className="w-5 h-5 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{label} {tx.chain}</p>
                                                        <p className={`text-[10px] font-bold mt-0.5 uppercase tracking-wider ${
                                                            tx.status === 'CONFIRMED' ? 'text-emerald-500' : 'text-amber-500'
                                                        }`}>
                                                            {tx.status} • {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black ${isSent ? 'text-white' : 'text-emerald-400'}`}>
                                                        {isSent ? '-' : '+'}{tx.amount}
                                                    </p>
                                                    {tx.gasFee > 0 && <p className="text-[10px] text-zinc-500 mt-0.5 uppercase font-medium">Gas: {tx.gasFee}</p>}
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

            {/* ── Modals Overlay System ── */}

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 px-0">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={() => setActiveModal(null)} />
                    
                    <div className="relative w-full h-full sm:h-auto sm:max-w-[400px] bg-zinc-900 sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                        {/* Shared Header */}
                        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                            <h2 className="text-xs font-black text-white uppercase tracking-widest ml-2">
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

                        {/* Modal Content areas */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                            
                            {/* SEND MODAL */}
                            {activeModal === 'SEND' && (
                                <form onSubmit={handleSend} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Send to</label>
                                        <input
                                            required
                                            autoFocus
                                            value={txForm.recipient}
                                            onChange={e => { setTxForm({ ...txForm, recipient: e.target.value }); setTxError(''); }}
                                            placeholder={activeNetwork === 'ARG' ? 'Search, public address (arg1...)' : 'Search, public address (0x...)'}
                                            className="w-full bg-zinc-950 border border-zinc-800 text-white py-3 px-4 rounded-xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none font-mono text-xs placeholder:text-zinc-600 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Asset</label>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-not-allowed opacity-80">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeNetwork === 'ARG' ? 'bg-maroon' : 'bg-white'}`}>
                                                {activeNetwork === 'ARG' ? <ArgusLogo className="w-4 h-4 text-white" /> : <EthLogo className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-white leading-tight">{activeNetwork}</p>
                                                <p className="text-[10px] text-zinc-500 font-mono tracking-wider">Balance: {displayBalanceData.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Amount</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="number"
                                                step="any"
                                                min="0"
                                                value={txForm.amount}
                                                onChange={e => { setTxForm({ ...txForm, amount: e.target.value }); setTxError(''); }}
                                                placeholder="0"
                                                className="w-full bg-zinc-950 border border-zinc-800 text-white py-4 px-4 pr-16 rounded-xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none text-2xl font-black placeholder:text-zinc-700 transition-all text-center"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">{activeNetwork}</span>
                                        </div>
                                    </div>

                                    {activeNetwork === 'ARG' && (
                                        <div className="flex justify-between items-center p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Gas Fee</span>
                                            <span className="text-xs font-bold text-zinc-300">0.001 ARG</span>
                                        </div>
                                    )}

                                    {txError && (
                                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <p className="text-[10px] text-red-400 font-medium">{txError}</p>
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-maroon text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                                        >
                                            {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin"/> Processing</> : 'Next'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* RECEIVE MODAL */}
                            {activeModal === 'RECEIVE' && (
                                <div className="flex flex-col items-center">
                                    <div className="p-4 bg-white rounded-3xl w-48 h-48 flex-shrink-0 mb-6">
                                        <QRCode data={currentAddress} />
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center cursor-pointer hover:border-maroon/50 transition-colors group" onClick={copyAddress}>
                                            <p className="text-sm font-mono text-zinc-300 break-all mb-2">{currentAddress}</p>
                                            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-maroon hover:text-white transition-colors">
                                                <Copy className="w-3.5 h-3.5" /> Copy Address
                                            </div>
                                        </div>
                                        <p className="text-center text-[10px] text-zinc-500 leading-relaxed font-medium">
                                            Only send <strong className="text-white">{activeNetwork}</strong> to this address. Sending other assets may result in permanent loss.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* MOCKED MODALS (SWAP/BUY) */}
                            {(activeModal === 'SWAP' || activeModal === 'BUY') && (
                                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                        <AlertCircle className="w-8 h-8 text-zinc-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2">{activeModal === 'SWAP' ? 'Swap Unavailable' : 'Purchasing Disabled'}</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed max-w-[250px]">
                                        {activeModal === 'SWAP' 
                                            ? 'The Argus DEX module is currently undergoing security audits. Check back later.' 
                                            : 'Fiat on-ramp providers are currently disabled for your region.'}
                                    </p>
                                </div>
                            )}

                            {/* TX DETAIL MODAL */}
                            {activeModal === 'TX_DETAIL' && selectedTx && (
                                <div className="space-y-6">
                                    <div className="text-center pb-6 border-b border-zinc-800">
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Amount</p>
                                        <p className="text-4xl font-black text-white">
                                            {selectedTx.amount} <span className="text-sm text-zinc-500">{selectedTx.chain}</span>
                                        </p>
                                    </div>
                                    <div className="space-y-4 text-xs font-mono">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="text-zinc-500 pt-0.5">Status</span>
                                            <span className={`px-2 py-0.5 rounded font-black tracking-widest uppercase text-[9px] ${selectedTx.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {selectedTx.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="text-zinc-500">Date</span>
                                            <span className="text-white text-right">{new Date(selectedTx.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="text-zinc-500">From</span>
                                            <span className="text-zinc-300 break-all text-right ml-8">{selectedTx.from}</span>
                                        </div>
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="text-zinc-500">To</span>
                                            <span className="text-zinc-300 break-all text-right ml-8">{selectedTx.to}</span>
                                        </div>
                                        {selectedTx.chain === 'ARG' && (
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-zinc-500">Gas Fee</span>
                                                <span className="text-white">{selectedTx.gasFee} ARG</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start gap-4 pt-4 border-t border-zinc-800/50">
                                            <span className="text-zinc-500">Hash</span>
                                            <span className="text-zinc-500 break-all text-right ml-8 text-[10px]">{selectedTx.txHash}</span>
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
