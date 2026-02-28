
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import {
    Wallet as WalletIcon,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    ShieldCheck,
    Copy,
    ExternalLink,
    ChevronRight,
    Loader2,
    RefreshCcw,
    Zap,
    Globe
} from 'lucide-react';

const Vault = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SEND' | 'RECEIVE' | 'HISTORY'>('OVERVIEW');
    const [activeChain, setActiveChain] = useState<'ARG' | 'ETH'>('ARG');
    const [balance, setBalance] = useState({ arg: 0, eth: '0' });
    const [addresses, setAddresses] = useState({ arg: '', eth: '' });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [txForm, setTxForm] = useState({ recipient: '', amount: '' });

    // Derivation of unique deterministic addresses for the user
    useEffect(() => {
        if (user?.uid) {
            const argAddr = ArgusSynapseService.generateAddress(user.uid);
            const ethAddr = EthereumService.generateAddress(user.uid);
            setAddresses({ arg: argAddr, eth: ethAddr });
        }
    }, [user]);

    const refreshBalances = async () => {
        setIsRefreshing(true);
        // Simulate network delay
        setTimeout(async () => {
            const argBal = await ArgusSynapseService.getBalance(addresses.arg);
            const ethBal = await EthereumService.getBalance(addresses.eth);
            setBalance({ arg: argBal, eth: ethBal });
            setIsRefreshing(false);
        }, 1000);
    };

    useEffect(() => {
        if (addresses.arg) refreshBalances();
    }, [addresses]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Simulate transaction lifecycle on Argus-Synapse
        setTimeout(() => {
            setIsProcessing(false);
            setActiveTab('HISTORY');
            setTxForm({ recipient: '', amount: '' });
        }, 2000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // In a real app we'd show a toast
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Balance Card */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-900 shadow-2xl p-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-maroon/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-maroon/10 border border-maroon/20 rounded-2xl">
                                <ShieldCheck className="w-5 h-5 text-maroon animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-sm font-mono font-bold text-zinc-500 uppercase tracking-widest">Operator_Vault_v2.4</h1>
                                <p className="text-[10px] text-maroon font-black uppercase flex items-center gap-1.5 mt-1">
                                    <span className="w-1 h-1 bg-maroon rounded-full"></span>
                                    GhostDAG_Synced
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-5xl font-black text-white tracking-tighter italic">
                                {activeChain === 'ARG' ? `${balance.arg.toLocaleString()} ARG` : `${balance.eth} ETH`}
                            </p>
                            <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                                <span className="opacity-40">≈ $12,402.00 USD</span>
                                <span className="px-1.5 py-0.5 bg-maroon/10 text-maroon rounded text-[8px] font-bold">+4.2%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
                            <button
                                onClick={() => setActiveChain('ARG')}
                                className={`flex-1 md:w-24 py-2 text-[10px] font-bold rounded-lg transition-all ${activeChain === 'ARG' ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'text-zinc-500 hover:text-white'}`}
                            >
                                ARG_NET
                            </button>
                            <button
                                onClick={() => setActiveChain('ETH')}
                                className={`flex-1 md:w-24 py-2 text-[10px] font-bold rounded-lg transition-all ${activeChain === 'ETH' ? 'bg-white text-zinc-950 shadow-lg shadow-white/20' : 'text-zinc-500 hover:text-white'}`}
                            >
                                ETH_NET
                            </button>
                        </div>
                        <button
                            onClick={refreshBalances}
                            disabled={isRefreshing}
                            className="flex items-center justify-center gap-2 py-3 px-6 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all group"
                        >
                            <RefreshCcw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-maroon' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Sync_Network</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-3 space-y-2">
                    {[
                        { id: 'OVERVIEW', label: 'Overview', icon: WalletIcon },
                        { id: 'SEND', label: 'Dispatch', icon: ArrowUpRight },
                        { id: 'RECEIVE', label: 'Inbound', icon: ArrowDownLeft },
                        { id: 'HISTORY', label: 'Logs', icon: History }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group ${activeTab === item.id
                                ? 'bg-zinc-900 border-zinc-800 text-white shadow-xl'
                                : 'bg-transparent border-transparent text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'}`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-4 h-4 transition-transform duration-500 ${activeTab === item.id ? 'text-maroon scale-110' : 'group-hover:scale-110'}`} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                            </div>
                            <ChevronRight className={`w-3 h-3 opacity-0 transition-all ${activeTab === item.id ? 'opacity-40 -translate-x-1' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 silk-panel rounded-[2rem] p-8 sm:p-12 relative overflow-hidden group min-h-[500px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 blur-[80px] rounded-full group-hover:bg-maroon/10 transition-silk pointer-events-none" />

                    {activeTab === 'OVERVIEW' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Vault_Asset_Map</h2>
                                    <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.2em]">Linearized Distribution</p>
                                </div>
                                <div className="w-10 h-10 border border-zinc-800 rounded-xl flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-maroon" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-maroon/30 transition-colors group/asset">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center text-white font-gothic text-xl">A</div>
                                        <span className="text-[8px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded">GhostDAG_Native</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-zinc-400 mb-1">Argus Protocol (ARG)</h3>
                                    <p className="text-2xl font-black text-white">{balance.arg.toLocaleString()} ARG</p>
                                </div>
                                <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:border-white/30 transition-colors group/asset">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-zinc-950">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <span className="text-[8px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded">ETH_Mainnet</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-zinc-400 mb-1">Ethereum (ETH)</h3>
                                    <p className="text-2xl font-black text-white">{balance.eth} ETH</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SEND' && (
                        <div className="space-y-8 animate-in fade-in duration-500 max-w-xl mx-auto">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Dispatch_Assets</h2>
                                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.2em]">Real-time Transaction Orchestration</p>
                            </div>

                            <form onSubmit={handleSend} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase ml-1">Recipient_Endpoint</label>
                                    <input
                                        required
                                        value={txForm.recipient}
                                        onChange={(e) => setTxForm({ ...txForm, recipient: e.target.value })}
                                        placeholder={activeChain === 'ARG' ? "arg..." : "0x..."}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 px-6 rounded-2xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none transition-all font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase ml-1">Transfer_Volume</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type="number"
                                            value={txForm.amount}
                                            onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 text-white py-4 px-6 rounded-2xl focus:border-maroon focus:ring-1 focus:ring-maroon/20 outline-none transition-all font-mono"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-600 uppercase">
                                            {activeChain}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        disabled={isProcessing}
                                        className="btn-premium flex-1 h-14"
                                    >
                                        {isProcessing ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Broadcast_Transaction</span>
                                                <Zap className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'RECEIVE' && (activeChain === 'ARG' || activeChain === 'ETH') && (
                        <div className="space-y-10 animate-in fade-in duration-500 flex flex-col items-center justify-center">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity_Beacon</h2>
                                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.2em]">Inbound Endpoint Connection</p>
                            </div>

                            <div className="relative p-6 bg-white rounded-3xl group/qr cursor-pointer hover:scale-105 transition-transform duration-500 shadow-2xl shadow-maroon/10">
                                <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center border-4 border-zinc-50">
                                    {/* Custom QR Sim with center logo */}
                                    <div className="relative">
                                        <div className="grid grid-cols-5 gap-1 opacity-80">
                                            {[...Array(25)].map((_, i) => (
                                                <div key={i} className={`w-8 h-8 ${Math.random() > 0.6 ? 'bg-zinc-900' : 'bg-transparent'} rounded-sm`} />
                                            ))}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center border-2 border-white">
                                                <span className="text-white font-gothic text-xl">{activeChain === 'ARG' ? 'A' : 'E'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full max-w-sm space-y-4">
                                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl relative group/addr">
                                    <p className="text-[8px] font-mono font-bold text-zinc-600 uppercase mb-2 tracking-widest">Operator_Endpoint</p>
                                    <p className="text-xs font-mono text-zinc-300 break-all leading-relaxed">
                                        {activeChain === 'ARG' ? addresses.arg : addresses.eth}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(activeChain === 'ARG' ? addresses.arg : addresses.eth)}
                                        className="absolute right-4 bottom-4 p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-500 hover:text-maroon hover:border-maroon/30 transition-all opacity-0 group-hover/addr:opacity-100"
                                    >
                                        <Copy className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] text-zinc-600 font-medium">Verify that assets are dispatched via the <span className="text-maroon font-bold">{activeChain === 'ARG' ? 'Argus Protocol' : 'Ethereum Network'}</span> only.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'HISTORY' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Orchestration_Logs</h2>
                                <span className="text-[10px] font-mono font-bold text-maroon bg-maroon/10 px-3 py-1 rounded-full uppercase">Realtime_Feed</span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { type: 'SEND', asset: 'ARG', amount: '25.00', status: 'CONFIRMED', time: '5m ago', id: '0xce8...7fd' },
                                    { type: 'RECEIVE', asset: 'ARG', amount: '15.00', status: 'CONFIRMED', time: '1h ago', id: '0x81d...4fa' },
                                    { type: 'MINT', asset: 'NFT', amount: '1.0', status: 'CONFIRMED', time: '2d ago', id: '0xc85...92e' },
                                    { type: 'REWARD', asset: 'ARG', amount: '100.0', status: 'CONFIRMED', time: '3d ago', id: '0xa00...22e' }
                                ].map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-zinc-900/30 border border-zinc-900 rounded-2xl hover:bg-zinc-900/50 hover:border-zinc-800 transition-all cursor-crosshair group/tx">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl border ${tx.type === 'SEND' ? 'bg-orange-500/5 border-orange-500/20 text-orange-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                                                {tx.type === 'SEND' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-white uppercase">{tx.type} {tx.asset}</span>
                                                    <span className="text-[8px] font-mono text-zinc-600 group-hover/tx:text-zinc-400 transition-colors uppercase">{tx.id}</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-600 font-medium">{tx.time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${tx.type === 'SEND' ? 'text-zinc-200' : 'text-maroon'}`}>
                                                {tx.type === 'SEND' ? '-' : '+'}{tx.amount}
                                            </p>
                                            <p className="text-[8px] font-mono text-zinc-700 uppercase">{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 border border-zinc-900 rounded-2xl text-[10px] font-bold text-zinc-600 hover:text-white hover:border-zinc-800 transition-all uppercase tracking-widest bg-zinc-900/20">
                                Load_More_Logs
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Vault;
