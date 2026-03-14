import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Box, Activity, ArrowRight, Clock, Hash, 
  User, Database, Zap, Shield, Globe, Terminal,
  TrendingUp, Layers, Cpu, Share2, Grid, List,
  ArrowUpRight, ArrowDownLeft, FileText, Code,
  Eye, PenTool, BarChart3, Bell, Tag, Info,
  ExternalLink, ChevronRight, Filter, Download,
  Copy, CheckCircle2, AlertCircle, RefreshCw, MoveRight, RotateCcw,
  ShieldCheck, Upload, Scale, Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  subscribeToNetworkStats, 
  calculateCurrentBlockHeight,
  subscribeToActiveMinerCount,
  db,
  AVG_BLOCK_TIME_MS,
  BASE_MINING_RATE
} from '../services/firebase';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { NetworkStats } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import SEO from '../components/SEO';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { ArgusLogo } from '../components/ArgusLogo';
import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore';

// --- STYLING CONSTANTS ---
const PANEL_GLASS = "bg-zinc-950/40 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] shadow-2xl overflow-hidden group";
const INPUT_STYLE = "bg-black/60 border border-white/[0.05] text-white px-6 py-4 rounded-xl focus:border-maroon/40 focus:bg-zinc-950/90 outline-none transition-all placeholder:text-zinc-800 font-mono text-xs tracking-widest uppercase";
const BADGE_MAROON = "px-2 py-0.5 bg-maroon/10 border border-maroon/20 text-maroon text-[8px] font-black uppercase tracking-widest rounded";
const BADGE_ZINC = "px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-widest rounded";

// --- HELPERS ---
const shortenHash = (hash: string) => hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : 'N/A';
const formatTime = (ts: number) => {
  const diff = Date.now() - ts;
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(ts).toLocaleTimeString();
};

// --- COMPONENTS ---

const TransactionView = ({ data }: { data: any }) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'logs' | 'internal' | 'state'>('overview');

  const statusColor = data.status === 'CONFIRMED' ? 'text-emerald-500' : data.status === 'PENDING' ? 'text-amber-500' : 'text-red-500';
  const statusBg = data.status === 'CONFIRMED' ? 'bg-emerald-500/10' : data.status === 'PENDING' ? 'bg-amber-500/10' : 'bg-red-500/10';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Tx_Payload_Manifest</h2>
            <div className={`px-3 py-1 rounded-full ${statusBg} border border-white/5 flex items-center gap-2`}>
              <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'PENDING' ? 'animate-pulse bg-amber-500' : statusColor.replace('text-', 'bg-')}`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}>{data.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 group/hash">
            <span className="text-[10px] text-zinc-500 font-mono break-all">{data.hash || data.txHash || data.id}</span>
            <button onClick={() => navigator.clipboard.writeText(data.hash || data.txHash || data.id)} className="p-1 hover:bg-zinc-900 rounded transition-colors opacity-0 group-hover/hash:opacity-100">
              <Copy className="w-3 h-3 text-zinc-600 hover:text-white" />
            </button>
          </div>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
              <Share2 className="w-3 h-3" /> Broadcast_Signal
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-maroon/20 border border-maroon/40 rounded-xl text-[9px] font-black uppercase tracking-widest text-maroon hover:bg-maroon hover:text-white transition-all">
              <RotateCcw className="w-3 h-3" /> Simulate_Tx
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Sub Navigation */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/5 rounded-2xl w-fit">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'logs', label: 'Logs_Events', icon: List },
              { id: 'internal', label: 'Internal_Calls', icon: Layers },
              { id: 'state', label: 'State_Changes', icon: Activity }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-zinc-900 text-white shadow-xl' : 'text-zinc-600 hover:text-white'}`}
              >
                <tab.icon className="w-3 h-3" /> {tab.label}
              </button>
            ))}
          </div>

          <div className={PANEL_GLASS + " p-10 space-y-12"}>
            {activeSubTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
                <TxField label="Origin_Vector" val={data.from} isAddress />
                <TxField label="Destination_Target" val={data.to} isAddress />
                <TxField label="Transmission_Value" val={`${(data.amount || 0).toLocaleString()} ARG`} sub={`≈ $${((data.amount || 0) * 0.5).toLocaleString()} USD`} />
                <TxField label="Network_Fee_Burn" val={`${(data.gasFee || 0.00042).toFixed(6)} ARG`} sub="Protocol_Execution_Fee" />
                <TxField label="Block_Sequence" val={`#${(data.blockNumber || calculateCurrentBlockHeight()).toLocaleString()}`} sub={`${data.confirmations || 1} Confirmations`} />
                <TxField label="Timestamp" val={new Date(data.createdAt || Date.now()).toUTCString()} sub={formatTime(data.createdAt || Date.now())} />
                <div className="md:col-span-2 pt-6 border-t border-white/[0.03] space-y-4">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-maroon" /> Decoded_Input_Data
                  </p>
                  <div className="bg-black/60 rounded-2x border border-white/5 p-6 overflow-x-auto">
                    <pre className="font-mono text-[10px] text-zinc-400">
                      {`Function: transfer(address _to, uint256 _value)
MethodID: 0xa9059cbb
[0]:  ${data.to || '0x0000000000000000000000000000000000000000'}
[1]:  ${(data.amount || 0) * 1e18}`}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'logs' && (
              <div className="space-y-6">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Events_Emitted (0)</p>
                <div className="space-y-4">
                  {[1].map(i => (
                    <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-maroon uppercase tracking-widest">Transfer_Event</span>
                         <span className="text-[8px] text-zinc-700 font-mono">Index: 0</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2 font-mono text-[10px] text-zinc-500">
                        <p><span className="text-zinc-700 uppercase">From:</span> {data.from}</p>
                        <p><span className="text-zinc-700 uppercase">To:</span> {data.to}</p>
                        <p><span className="text-zinc-700 uppercase">Value:</span> {data.amount || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className={PANEL_GLASS + " p-8 h-fit"}>
              <p className="text-[10px] font-black text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                Execution_Audit
                <Activity className="w-3 h-3 text-maroon animate-pulse" />
              </p>
              <div className="space-y-6">
                 <MetricRow label="Gas_Limit" val="21,000" />
                 <MetricRow label="Gas_Usage" val="21,000 (100%)" />
                 <MetricRow label="Gas_Price" val="4.2 Gwei" />
                  <MetricRow label="Nonce" val={(data.nonce || 0).toString()} />
                 <MetricRow label="Network_Shard" val="Sector_04" />
                 <div className="pt-4 border-t border-white/5">
                   <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">Verification_Hash</p>
                   <p className="text-[10px] font-mono text-zinc-400 break-all">0x7d2f...a19c</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const TxField = ({ label, val, sub, isAddress }: { label: string, val: string, sub?: string, isAddress?: boolean }) => (
  <div className="space-y-2">
    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">{label}</p>
    <div className="flex items-center gap-2 group/val">
      <p className={`text-sm font-black text-white tracking-tight ${isAddress ? 'font-mono text-xs opacity-80' : ''}`}>
        {isAddress ? val : val}
      </p>
      {isAddress && (
        <button onClick={() => navigator.clipboard.writeText(val)} className="p-1 hover:bg-zinc-900 rounded opacity-0 group-hover/val:opacity-100 transition-opacity">
          <Copy className="w-3 h-3 text-zinc-700" />
        </button>
      )}
    </div>
    {sub && <p className="text-[9px] text-maroon font-black tracking-widest uppercase opacity-60">{sub}</p>}
  </div>
);

const BlockView = ({ data }: { data: any }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Ledger_Registry_Segment</h2>
        <div className="flex items-center gap-4">
          <span className={BADGE_MAROON}>BLOCK_HEIGHT: #{data.height || 4821093}</span>
          <span className={BADGE_ZINC}>HASH: {shortenHash(data.hash || '0x4af8816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c2')}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Validator_Node', val: shortenHash(data.miner || 'arg...kernel'), icon: Cpu, sub: `Reward: ${BASE_MINING_RATE} ARG` },
        { label: 'Transmission_Count', val: `${data.txCount || 0} Packets`, icon: Activity, sub: 'Density: Variable' },
        { label: 'Gas_Usage', val: '0 / 15.0M', icon: Zap, sub: 'Utilization: 0%' },
        { label: 'Burnt_Fees', val: '0.0000 ARG', icon: RefreshCw, sub: 'EIP-1559_Active' }
      ].map((item, i) => (
        <div key={i} className={PANEL_GLASS + " p-6 space-y-3"}>
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.label}</p>
            <item.icon className="w-4 h-4 text-zinc-800" />
          </div>
          <p className="text-lg font-black text-white tracking-tight">{item.val}</p>
          <p className="text-[8px] text-maroon font-bold tracking-widest uppercase opacity-60">{item.sub}</p>
        </div>
      ))}
    </div>

    <div className={PANEL_GLASS}>
      <div className="px-8 py-6 border-b border-white/[0.03] bg-black/40 flex items-center justify-between">
        <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Included_Transmissions</p>
        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Shard_04_Registry</span>
      </div>
      <div className="p-8">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] text-zinc-700 font-black uppercase tracking-widest border-b border-white/5">
              <th className="pb-4">Hash</th>
              <th className="pb-4">From</th>
              <th className="pb-4">To</th>
              <th className="pb-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {(data.transactions || []).map((tx: any, i: number) => (
              <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                <td className="py-4 font-mono text-xs text-maroon font-bold">{shortenHash(tx.txHash || tx.id)}</td>
                <td className="py-4 font-mono text-xs text-zinc-500">{shortenHash(tx.from)}</td>
                <td className="py-4 font-mono text-xs text-zinc-500">{shortenHash(tx.to)}</td>
                <td className="py-4 font-black text-white text-right text-xs">{(tx.amount || 0).toFixed(4)} ARG</td>
              </tr>
            ))}
            {(data.transactions || []).length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[10px] text-zinc-700 uppercase font-black tracking-widest italic">
                  Data_Indexing_In_Progress
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AddressView = ({ data }: { data: any }) => {
  const [activeTab, setActiveTab] = useState<'transfers' | 'internal' | 'erc20' | 'nfts' | 'analytics'>('transfers');
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identity_Protocol_Matrix</h2>
          <div className="flex items-center gap-4">
            <span className={BADGE_MAROON}>ADDRESS: {data.address}</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1.5">
              <Shield className="w-2.5 h-2.5" /> VERIFIED_ORIGIN
            </span>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all shadow-2xl">
              <PenTool className="w-4 h-4" /> Message_Identity
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className={PANEL_GLASS + " p-8 space-y-10"}>
            <div className="space-y-2">
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Total_Capital_Balance</p>
              <p className="text-4xl font-black text-white tracking-tighter italic">{(data.points || 0).toLocaleString()} <span className="text-maroon text-2xl font-mono">ARG</span></p>
              <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">≈ ${((data.points || 0) * 0.5).toLocaleString()} USD</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/[0.05]">
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Inbound_Activity</p>
                  <div className="flex items-center gap-2 text-emerald-500 font-black tracking-tighter">
                     <ArrowDownLeft className="w-4 h-4" /> 182 TXS
                  </div>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">Outbound_Activity</p>
                  <div className="flex items-center gap-2 text-maroon font-black tracking-tighter">
                     <ArrowUpRight className="w-4 h-4" /> 64 TXS
                  </div>
               </div>
            </div>
            
            <div className="space-y-4 pt-10 border-t border-white/[0.05]">
               <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Asset_Holdings_Matrix</p>
               <div className="space-y-3">
                  <TokenHoldingRow symbol="ARG" name="Argus Protocol" balance={(data.points || 0).toLocaleString()} val={`$${((data.points || 0) * 0.5).toLocaleString()}`} />
                </div>
            </div>

            <div className="pt-10 border-t border-white/[0.05]">
               <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Identity_Labels</p>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Institutional_Whale</span>
                 <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em]">Genesis_Node</span>
               </div>
            </div>
         </div>

         <div className={PANEL_GLASS + " lg:col-span-3 flex flex-col"}>
            <div className="flex items-center overflow-x-auto custom-scrollbar border-b border-white/[0.05]">
               {[
                 { id: 'transfers', label: 'Transfers', icon: RefreshCw },
                 { id: 'internal', label: 'Internal_Txs', icon: Layers },
                 { id: 'erc20', label: 'ERC-20', icon: Database },
                 { id: 'nfts', label: 'NFTs', icon: Grid },
                 { id: 'analytics', label: 'Analytics', icon: BarChart3 }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === tab.id ? 'text-white border-maroon bg-white/[0.02]' : 'text-zinc-600 border-transparent hover:text-zinc-300'}`}
                 >
                   <tab.icon className="w-3.5 h-3.5" />
                   {tab.label}
                 </button>
               ))}
            </div>
            <div className="p-8 flex-grow">
               <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center justify-between p-5 bg-black/40 border border-white/[0.02] rounded-2xl hover:border-maroon/20 transition-all group/item cursor-pointer">
                       <div className="flex items-center gap-5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-maroon/10 text-maroon'} border border-white/5`}>
                             {i % 2 === 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-tight italic flex items-center gap-2">
                               {i % 2 === 0 ? 'Inbound_Transfer' : 'Outbound_Execution'}
                               <span className="text-[8px] text-zinc-700 font-mono tracking-tighter opacity-0 group-hover/item:opacity-100 transition-opacity italic">Data_Registry_Syncing...</span>
                             </p>
                             <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">2 hours ago | block #4,821,092</p>
                          </div>
                       </div>
                       <div className="text-right">
                           <p className={`text-sm font-black tracking-tighter ${i % 2 === 0 ? 'text-emerald-500' : 'text-white'}`}>--- ARG</p>
                          <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest">{shortenHash('0xabcde12345...')}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, val, icon: Icon, color = "text-white" }: { label: string, val: string, icon?: any, color?: string }) => (
  <div className="flex items-center justify-between py-1">
    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">{label}</p>
    <div className="flex items-center gap-2">
      {Icon && <Icon className={`w-3 h-3 ${color}`} />}
      <span className={`text-[11px] font-black tracking-tight ${color}`}>{val}</span>
    </div>
  </div>
);

const TokenHoldingRow = ({ symbol, name, balance, val }: { symbol: string, name: string, balance: string, val: string }) => (
  <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex items-center justify-between group hover:border-maroon/20 transition-all">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5 text-[10px] font-black text-maroon">{symbol[0]}</div>
      <div>
        <p className="text-[10px] font-black text-white tracking-widest">{symbol}</p>
        <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">{name}</p>
      </div>
    </div>
    <div className="text-right">
       <p className="text-[10px] font-black text-white tracking-tight">{balance}</p>
       <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">{val}</p>
    </div>
  </div>
);

const DashboardTerminal = ({ recentBlocks, recentTxs, shortenHash, formatTime }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 overflow-hidden">
    <div className={PANEL_GLASS}>
      <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Box className="w-4 h-4 text-maroon" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Recent_Blocks_Live</span>
        </div>
        <button className="text-[8px] font-black text-zinc-600 hover:text-white transition-all uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">View_Registry</button>
      </div>
      <div className="divide-y divide-white/[0.02] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {recentBlocks.map((block: any) => (
            <motion.div key={block.height} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group/row">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center justify-center group-hover/row:border-maroon/30 transition-all duration-500">
                   <Box className="w-3 h-3 text-zinc-700 group-hover/row:text-maroon transition-colors" />
                   <span className="text-[8px] font-black text-zinc-500 uppercase mt-1">BLK</span>
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-none">#{block.height}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1.5 tracking-widest">{formatTime(block.timestamp)}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-[9px] text-zinc-500 font-black tracking-widest">MINER:</span>
                    <span className="text-[9px] text-maroon font-bold font-mono">{shortenHash(block.miner)}</span>
                 </div>
                 <p className="text-[10px] text-zinc-400 font-black tracking-tighter uppercase">{block.txCount} Transmissions</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
    <div className={PANEL_GLASS}>
      <div className="px-8 py-6 border-b border-white/[0.03] flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-4">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white italic">Transmission_Matrix</span>
        </div>
        <button className="text-[8px] font-black text-zinc-600 hover:text-white transition-all uppercase tracking-widest border border-white/5 px-3 py-1 rounded-lg">All_Packets</button>
      </div>
      <div className="divide-y divide-white/[0.02] overflow-hidden">
        <AnimatePresence mode="popLayout">
          {recentTxs.map((tx: any) => (
            <motion.div key={tx.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="px-8 py-6 flex items-center justify-between hover:bg-white/[0.01] transition-all group/row">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-900 rounded-xl flex flex-col items-center justify-center group-hover/row:border-emerald-500/30 transition-all duration-500">
                   <Zap className="w-3 h-3 text-zinc-700 group-hover/row:text-emerald-500 transition-colors" />
                   <span className="text-[8px] font-black text-zinc-500 uppercase mt-1">TXN</span>
                </div>
                <div>
                  <p className="text-xs font-black text-white hover:text-maroon transition-colors cursor-pointer">{shortenHash(tx.id)}</p>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase mt-1.5 tracking-widest">{formatTime(tx.createdAt)}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-[9px] text-zinc-500 font-black tracking-widest">VALUE:</span>
                    <span className="text-xs font-black text-white">{(tx.amount || 0).toFixed(4)} ARG</span>
                 </div>
                 <div className="flex items-center gap-2 justify-end text-zinc-800">
                    <span className="text-[8px] uppercase tracking-widest">FROM_U:</span>
                    <span className="text-[9px] font-mono italic">{shortenHash(tx.from)}</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

const GasTrackerView = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
     <div className="text-center space-y-4 max-w-2xl mx-auto relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full relative z-10">
          <Zap className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Network_Priority_Oracle_Active</span>
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic relative z-10">Transmission_Cost_Oracle</h2>
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em] relative z-10">Predictive prioritization metrics for the Argus high-throughput kernel.</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Low_Priority', val: '1.2 Gwei', time: '~ 5 mins', base: '0.8', priority: '0.4', color: 'text-zinc-500', bg: 'bg-zinc-950/40' },
          { label: 'Standard_Execution', val: '4.2 Gwei', time: '~ 1 min', base: '0.8', priority: '3.4', color: 'text-white', bg: 'bg-white/[0.02]' },
          { label: 'High_Priority', val: '8.5 Gwei', time: '< 15s', base: '0.8', priority: '7.7', color: 'text-maroon', bg: 'bg-maroon/5' }
        ].map((item, i) => (
          <div key={i} className={`${PANEL_GLASS} ${item.bg} p-10 space-y-6 text-center group/gas hover:border-maroon/20 transition-all`}>
             <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">{item.label}</p>
             <p className={`text-6xl font-black tracking-tighter ${item.color} group-hover/gas:scale-110 transition-transform duration-700`}>{item.val}</p>
             <div className="space-y-1">
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">{item.time}</p>
                <p className="text-[8px] text-zinc-800 font-black uppercase tracking-widest">Base: {item.base} | Priority: {item.priority}</p>
             </div>
          </div>
        ))}
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={PANEL_GLASS + " p-10"}>
           <p className="text-[10px] font-black text-white uppercase tracking-widest mb-10 flex items-center gap-4 italic">
              <TrendingUp className="w-4 h-4 text-maroon" /> Estimated_Operation_Costs
           </p>
           <div className="grid grid-cols-2 gap-y-10 gap-x-6">
              {[
                { op: 'Address_Transfer', cost: '$0.0042', gas: '21,000', icon: MoveRight },
                { op: 'Asset_Minting', cost: '$1.24', gas: '120,400', icon: Database },
                { op: 'Registry_Write', cost: '$0.85', gas: '85,000', icon: PenTool },
                { op: 'Liquid_Swap', cost: '$2.10', gas: '210,000', icon: RefreshCw }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group/op">
                   <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5 group-hover/op:border-maroon/40 transition-colors">
                      <item.icon className="w-4 h-4 text-zinc-600 group-hover/op:text-maroon transition-colors" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.op}</p>
                      <p className="text-xl font-black text-white tracking-tight">{item.cost}</p>
                      <p className="text-[8px] text-zinc-800 font-bold uppercase tracking-widest">Est_Gas: {item.gas}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
        <div className={PANEL_GLASS + " p-10 flex flex-col"}>
           <p className="text-[10px] font-black text-white uppercase tracking-widest mb-10 italic">Gas_Price_Trajectory_24H</p>
           <div className="flex-grow flex items-end gap-1.5 pb-2">
              {[...Array(30)].map((_, i) => (
                 <div key={i} className="flex-grow bg-emerald-500/20 hover:bg-emerald-500/60 transition-colors rounded-t-[2px]" style={{ height: `${20 + (i * 2) % 60}%` }} />
              ))}
           </div>
           <div className="flex justify-between text-[8px] text-zinc-800 font-black uppercase tracking-widest pt-4 border-t border-white/5 mt-2">
              <span>AVG: 4.1 Gwei</span><span>PEAK: 12.8 Gwei</span>
           </div>
        </div>
     </div>
  </div>
);

const NFTExplorerView = () => {
  const [selectedNFT, setSelectedNFT] = useState<any>(null);

  const nfts: any[] = []; // NFTs data indexing in progress

  if (selectedNFT) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto">
        <div className={PANEL_GLASS + " grid grid-cols-1 md:grid-cols-2 overflow-hidden"}>
           <div className="aspect-square bg-zinc-950 flex items-center justify-center p-20 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-maroon/20 via-transparent to-transparent opacity-40"></div>
              <Grid className="w-32 h-32 text-maroon/40 absolute blur-3xl" />
              <div className="relative z-10 w-full h-full border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-6 bg-black/40 backdrop-blur-3xl group cursor-none">
                 <div className="w-24 h-24 bg-maroon/20 rounded-full blur-[50px] animate-pulse"></div>
                 <Grid className="w-16 h-16 text-white absolute" />
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em] mt-24 italic opacity-40">Visual_Nexus_Render</span>
              </div>
           </div>
           <div className="p-12 space-y-10 bg-black/60">
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-maroon/20 border border-maroon/40 text-maroon text-[9px] font-black uppercase tracking-widest rounded-full">{selectedNFT.rarity}</span>
                    <button onClick={() => setSelectedNFT(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><RotateCcw className="w-4 h-4 text-zinc-600" /></button>
                 </div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{selectedNFT.name} <span className="text-maroon">#{selectedNFT.id}</span></h2>
                 <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em]">PART OF: {selectedNFT.collection}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-2">
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest italic">Consensus_Power</p>
                    <p className="text-2xl font-black text-white tracking-tighter italic">{selectedNFT.power}%</p>
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${selectedNFT.power}%` }} />
                    </div>
                 </div>
                 <div className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl space-y-2">
                    <p className="text-[8px] text-zinc-700 font-black uppercase tracking-widest italic">Temporal_Index</p>
                    <p className="text-2xl font-black text-white tracking-tighter italic">#{1024 - selectedNFT.id * 12}</p>
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden">
                       <div className="h-full bg-maroon" style={{ width: '65%' }} />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-10 border-t border-white/5">
                 <p className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Terminal className="w-3.5 h-3.5 text-maroon" /> Metadata_Payload
                 </p>
                 <div className="bg-black/80 rounded-2xl p-6 font-mono text-[9px] text-zinc-500 space-y-2 border border-white/[0.03]">
                    <p><span className="text-maroon">hash:</span> {selectedNFT.hash}</p>
                    <p><span className="text-maroon">origin:</span> 0xkernel_main</p>
                     <p><span className="text-maroon">entropy:</span> 0xkernel_entropy_v42</p>
                    <p><span className="text-maroon">timestamp:</span> {Date.now()}</p>
                 </div>
              </div>

              <button className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-maroon hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                Initiate_Transmission_Lock
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className={PANEL_GLASS + " p-12 text-center space-y-6"}>
         <div className="w-24 h-24 bg-maroon/5 rounded-[2rem] border border-maroon/10 flex items-center justify-center mx-auto transition-transform hover:rotate-12 duration-700">
            <Grid className="w-10 h-10 text-maroon" />
         </div>
         <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Collectible_Nexus</h2>
         <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em]">Visually audit non-fungible artifacts secured by the kernel.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {nfts.map((nft, idx) => (
            <div key={idx} onClick={() => setSelectedNFT(nft)} className={PANEL_GLASS + " group/nft cursor-pointer hover:border-maroon/30 transition-all flex flex-col h-full bg-zinc-950/20"}>
               {/* NFT listing item */}
            </div>
         ))}
         {nfts.length === 0 && (
            <div className="col-span-full py-20 text-center silk-panel !bg-black/20 rounded-3xl border border-dashed border-zinc-900">
               <span className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.4em] italic leading-none">Transmission_Artifacts_Indexing...</span>
            </div>
         )}
      </div>
    </div>
  );
};

const ToolsView = () => {
  const [activeTool, setActiveTool] = useState<'approvals' | 'broadcast' | 'converter'>('approvals');
  
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Utility_Kernel_Extensions</h2>
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Administrative & Interaction toolset for protocol-engaged users.</p>
          </div>
          <div className="flex items-center gap-3 p-1 bg-zinc-950 border border-white/5 rounded-2xl">
             {[
               { id: 'approvals', label: 'Revocation', icon: ShieldCheck },
               { id: 'broadcast', label: 'Broadcaster', icon: Upload },
               { id: 'converter', label: 'Converter', icon: Scale }
             ].map(t => (
               <button 
                key={t.id} 
                onClick={() => setActiveTool(t.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTool === t.id ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:text-white'}`}
               >
                 <t.icon className="w-3.5 h-3.5" /> {t.label}
               </button>
             ))}
          </div>
       </div>

       {activeTool === 'approvals' && (
         <div className="space-y-8">
            <div className={PANEL_GLASS + " p-10 bg-maroon/[0.02] border-maroon/10"}>
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-maroon/20 rounded-2xl flex items-center justify-center border border-maroon/40 shadow-2xl shadow-maroon/20">
                     <ShieldCheck className="w-8 h-8 text-maroon" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Risk_Audit_Scanner</h3>
                     <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest leading-relaxed max-w-lg">
                       This utility scans your identity signature for open asset approvals. Malicious contracts can drain tokens without further interaction.
                     </p>
                  </div>
               </div>
            </div>

            <div className={PANEL_GLASS}>
               <div className="p-8">
                  <table className="w-full text-left">
                     <thead>
                       <tr className="text-[9px] text-zinc-700 font-black uppercase tracking-widest border-b border-white/5">
                         <th className="pb-4">Asset</th>
                         <th className="pb-4">Contract_Spender</th>
                         <th className="pb-4">Allowance</th>
                         <th className="pb-4 text-center">Security_Score</th>
                         <th className="pb-4 text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-white/[0.02]">
                       {[
                         { asset: 'ARG', spender: 'Uniswap_v3', allowance: 'Unlimited', risk: 'HIGH', score: '42' },
                         { asset: 'AUSD', spender: 'Aave_Protocol', allowance: '10,000', risk: 'LOW', score: '98' }
                       ].map((item, i) => (
                         <tr key={i} className="group/row hover:bg-white/[0.01]">
                            <td className="py-6 font-black text-white text-xs tracking-widest">{item.asset}</td>
                            <td className="py-6 font-mono text-[10px] text-zinc-500 italic">{item.spender}</td>
                            <td className="py-6 font-mono text-[10px] text-maroon uppercase">{item.allowance}</td>
                            <td className="py-6 text-center">
                               <span className={`text-[8px] font-black italic px-2 py-0.5 rounded ${item.risk === 'HIGH' ? 'bg-maroon/10 text-maroon border border-maroon/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{item.risk}_SIGNATURE</span>
                            </td>
                            <td className="py-6 text-right">
                               <button className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded text-[8px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all">Revoke_Access</button>
                            </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
       )}

       {activeTool === 'broadcast' && (
         <div className="max-w-4xl mx-auto space-y-8">
            <div className={PANEL_GLASS + " p-10 space-y-8"}>
               <div className="space-y-4">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Broad_Signal_Transmitter</h3>
                  <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Manually inject signed raw transaction hex into the Argus kernel.</p>
               </div>
               <div className="bg-black/80 rounded-2xl border border-white/5 p-8 font-mono text-[11px] text-maroon h-64 relative">
                  <textarea 
                    className="w-full h-full bg-transparent resize-none border-none outline-none placeholder:text-zinc-900" 
                    placeholder="0x6a401c4078816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c2..."
                  />
                  <div className="absolute bottom-6 right-6 flex items-center gap-3">
                     <span className="text-[8px] text-zinc-800 font-black uppercase tracking-widest italic">Hex_Validator_Online</span>
                  </div>
               </div>
               <button className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] rounded-xl hover:bg-maroon hover:text-white transition-all shadow-2xl">
                 Initiate_Packet_Broadcast
               </button>
            </div>
         </div>
       )}

       {activeTool === 'converter' && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className={PANEL_GLASS + " p-8 space-y-8"}>
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Temporal_Unit_Sync</h4>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Argus_Units (ARG)</label>
                     <input type="text" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-6 py-4 text-xl font-black text-white italic outline-none focus:border-maroon/40" defaultValue="1.0" />
                  </div>
                  <div className="flex justify-center -my-3 relative z-10">
                     <div className="bg-zinc-900 p-2 rounded-lg border border-white/5">
                        <Scale className="w-4 h-4 text-maroon" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Wei_Equivalent</label>
                     <p className="bg-black/60 border border-white/5 rounded-xl px-6 py-4 text-sm font-mono text-zinc-500 break-all">1,000,000,000,000,000,000</p>
                  </div>
               </div>
            </div>
            <div className={PANEL_GLASS + " p-8 space-y-8"}>
               <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Keccak-256_Visualizer</h4>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest">Input_String</label>
                     <input type="text" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-6 py-4 text-xs font-mono text-white outline-none focus:border-maroon/40" placeholder="Transfer(address,uint256)" />
                  </div>
                  <div className="space-y-2 pt-10">
                     <label className="text-[8px] text-zinc-700 font-black uppercase tracking-widest italic">Computed_Identity_Signature</label>
                     <div className="bg-black/60 border border-emerald-500/10 rounded-xl p-6 font-mono text-[10px] text-emerald-500/60 break-all">
                       0xa9059cbb283514120ec656667107...9cbb
                     </div>
                  </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

const ContractExplorerView = () => {
  const [activeTab, setActiveTab] = useState<'code' | 'read' | 'write' | 'events'>('code');
  
  const contractData = {
    address: '0x7d2fde90226a45951d41864f1c4078816c21a415',
    name: 'Argus_Kernel_Validator',
    compiler: 'Solc v0.8.20',
    optimization: 'Enabled (200 runs)',
    verifiedAt: '2026-03-12',
    constructorArgs: '0x0000...0042',
    sourceCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Argus_Kernel_Validator
 * @notice Authoritative consensus validator for the Argus high-throughput economy.
 */
contract Argus_Kernel_Validator {
    address public immutable KERNEL_ORIGIN;
    mapping(address => uint256) public validatorStakes;
    
    event StakeCommitted(address indexed validator, uint256 amount);
    
    constructor(address _origin) {
        KERNEL_ORIGIN = _origin;
    }
    
    /**
     * @dev Commits proof-of-stake to the kernel lattice.
     */
    function commitStake() external payable {
        require(msg.value >= 1 ether, "Insufficient_Stake");
        validatorStakes[msg.sender] += msg.value;
        emit StakeCommitted(msg.sender, msg.value);
    }
    
    function getValidatorPower(address _v) external view returns (uint256) {
        return validatorStakes[_v] / 10**18;
    }
}`
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Source_Integrity_Manifest</h2>
          <div className="flex items-center gap-4">
            <span className={BADGE_MAROON}>CONTRACT: {shortenHash(contractData.address)}</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1.5">
              <CheckCircle2 className="w-2.5 h-2.5" /> CODE_VERIFIED
            </span>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
              <Download className="w-3.5 h-3.5" /> Export_ABI
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/5 rounded-2xl w-fit">
               {[
                 { id: 'code', label: 'Source_Code', icon: Code },
                 { id: 'read', label: 'Read_Contract', icon: Eye },
                 { id: 'write', label: 'Write_Contract', icon: PenTool },
                 { id: 'events', label: 'Logs', icon: List }
               ].map(tab => (
                 <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-white'}`}
                 >
                   <tab.icon className="w-3 h-3" /> {tab.label}
                 </button>
               ))}
            </div>

            <div className={PANEL_GLASS}>
               {activeTab === 'code' && (
                 <div className="p-0 flex flex-col h-[600px]">
                    <div className="px-8 py-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
                       <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-2">
                         <FileText className="w-3 h-3 text-maroon" /> {contractData.name}.sol
                       </span>
                       <span className="text-[8px] text-zinc-700 font-mono">Lines: {contractData.sourceCode.split('\n').length}</span>
                    </div>
                    <div className="p-8 overflow-auto flex-grow custom-scrollbar bg-black/20">
                       <pre className="font-mono text-[11px] leading-relaxed">
                          {contractData.sourceCode.split('\n').map((line, i) => (
                            <div key={i} className="flex gap-8 group/line">
                               <span className="w-8 text-zinc-800 text-right select-none group-hover/line:text-maroon/40 transition-colors">{(i + 1).toString().padStart(2, '0')}</span>
                               <span className={line.includes('contract') || line.includes('function') ? 'text-maroon font-bold' : line.startsWith('//') ? 'text-zinc-700 italic' : line.includes('external') || line.includes('public') ? 'text-blue-500/70' : 'text-zinc-400'}>
                                 {line}
                               </span>
                            </div>
                          ))}
                       </pre>
                    </div>
                 </div>
               )}

               {activeTab === 'read' && (
                 <div className="p-10 space-y-6">
                    {[
                      { name: 'KERNEL_ORIGIN', type: 'address', val: '0xabc...def' },
                      { name: 'validatorStakes', inputs: [{ name: '_addr', type: 'address' }], type: 'uint256' },
                      { name: 'getValidatorPower', inputs: [{ name: '_v', type: 'address' }], type: 'uint256' }
                    ].map((fn, i) => (
                      <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{i + 1}. {fn.name}</span>
                            <span className="text-[8px] text-zinc-700 font-black uppercase bg-zinc-900 px-2 py-0.5 rounded">{fn.type}</span>
                         </div>
                         {fn.inputs && (
                           <div className="space-y-3">
                              {fn.inputs.map((input, j) => (
                                <div key={j} className="flex flex-col gap-1">
                                   <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">{input.name} ({input.type})</label>
                                   <input type="text" className="bg-zinc-950 border border-white/5 rounded-lg px-4 py-2 text-xs font-mono outline-none focus:border-maroon/40 transition-all" placeholder="Enter_Address..." />
                                </div>
                              ))}
                              <button className="px-6 py-2 bg-maroon/10 border border-maroon/20 text-maroon text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-maroon hover:text-white transition-all">Query_Manifest</button>
                           </div>
                         )}
                         {fn.val && <p className="text-xs font-mono text-zinc-400 mt-2">{fn.val}</p>}
                      </div>
                    ))}
                 </div>
               )}

               {activeTab === 'write' && (
                 <div className="p-10 space-y-6">
                    <div className="bg-maroon/5 border border-maroon/10 rounded-2xl p-6 flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <AlertCircle className="w-5 h-5 text-maroon" />
                          <p className="text-[10px] font-black text-maroon uppercase tracking-widest">Wallet_Authorization_Required</p>
                       </div>
                       <button className="px-6 py-2 bg-maroon text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:shadow-2xl shadow-maroon/20 transition-all">Connect_Kernel</button>
                    </div>
                    {[
                      { name: 'commitStake', inputs: [], value: true },
                      { name: 'setCommissionRatio', inputs: [{ name: '_ratio', type: 'uint256' }] }
                    ].map((fn, i) => (
                      <div key={i} className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-4 opacity-50 cursor-not-allowed">
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">{i + 1}. {fn.name}</span>
                         {fn.value && (
                            <div className="flex flex-col gap-1">
                              <label className="text-[8px] text-zinc-600 font-black uppercase tracking-widest italic">Payable_Value (ARG)</label>
                              <input disabled type="text" className="bg-zinc-950/50 border border-white/5 rounded-lg px-4 py-2 text-xs font-mono" placeholder="0.0" />
                            </div>
                         )}
                         <button disabled className="px-6 py-2 bg-zinc-900 border border-white/5 text-zinc-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Transmit_Payload</button>
                      </div>
                    ))}
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <div className={PANEL_GLASS + " p-8 space-y-8 h-fit"}>
               <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4 italic">Registry_Metadata</p>
               <div className="space-y-6">
                  <MetricRow label="Compiler" val={contractData.compiler} />
                  <MetricRow label="Optimization" val="200 Runs" />
                  <MetricRow label="Verified_At" val={contractData.verifiedAt} />
                  <div className="pt-4 border-t border-white/5 space-y-2">
                     <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Constructor_Arguments</p>
                     <p className="text-[9px] font-mono text-zinc-500 break-all bg-black/40 p-3 rounded-lg border border-white/5">0000000000000000000000007d2fde90226a45951d41864f1c4078816c21a415</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                     <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Security_Audit_Hash</p>
                     <p className="text-[9px] font-mono text-maroon break-all bg-maroon/5 p-3 rounded-lg border border-maroon/10 italic">sha256:7d2f...a19c (PASSED)</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- MAIN ARYUS SCAN COMPONENT ---
const ArgusScan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'nfts' | 'blocks' | 'txs' | 'tokens' | 'gas' | 'mempool' | 'contracts' | 'tools'>('dashboard');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeNodes, setActiveNodes] = useState(0); 

  // --- SUB-COMPONENTS (Defined inside to access state) ---

  const MempoolView = () => {
    const [filter, setFilter] = useState<'PRIORITY' | 'STANDARD' | 'STALE'>('PRIORITY');
    
    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-x-hidden">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Kernel_Mempool_Monitor</h2>
               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Packet_Queue_Density: Phase_04</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-white/5 rounded-2xl w-fit">
               {['PRIORITY', 'STANDARD', 'STALE'].map(f => (
                  <button 
                   key={f} 
                   onClick={() => setFilter(f as any)}
                   className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:text-white'}`}
                  >
                    {f}_Signals
                  </button>
                ))}
             </div>
          </div>
  
          <div className={PANEL_GLASS}>
             <div className="px-8 py-5 border-b border-white/[0.03] bg-black/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-maroon animate-ping" />
                   <span className="text-[9px] font-black text-maroon uppercase tracking-widest">Live_Surveillance_Active</span>
                </div>
                <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">Kernel_Mempool_Sector_04</span>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                     <tr className="text-[9px] text-zinc-600 font-black uppercase tracking-widest border-b border-white/5">
                       <th className="px-8 py-5">TXN_ID</th>
                       <th className="px-8 py-5">Source_Vector</th>
                       <th className="px-8 py-5 text-center">Gas_Oracle_Price</th>
                       <th className="px-8 py-5 text-right">Payload_Value</th>
                       <th className="px-8 py-5 text-right">Wait_Time</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.02]">
                     {recentTxs.filter(tx => tx.status === 'PENDING').map((tx: any, i: number) => (
                       <tr key={i} className="group/row hover:bg-white/[0.01] transition-all cursor-crosshair">
                         <td className="px-8 py-5 font-mono text-xs text-maroon font-bold opacity-60 group-hover/row:opacity-100 transition-opacity italic">{shortenHash(tx.txHash || tx.id)}</td>
                         <td className="px-8 py-5 font-mono text-xs text-zinc-500">{shortenHash(tx.from)}</td>
                         <td className="px-8 py-5 text-center">
                            <span className="text-[10px] font-black tracking-widest text-white">4.2 Gwei</span>
                         </td>
                         <td className="px-8 py-5 font-black text-white text-right text-xs">{(tx.amount || 0).toFixed(4)} ARG</td>
                         <td className="px-8 py-5 text-right">
                            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">{formatTime(tx.createdAt)}</span>
                         </td>
                       </tr>
                     ))}
                     {recentTxs.filter(tx => tx.status === 'PENDING').length === 0 && (
                       <tr>
                         <td colSpan={5} className="px-8 py-20 text-center text-[10px] text-zinc-700 font-black uppercase tracking-widest italic leading-none">
                           No_Pending_Signals_In_Pool
                         </td>
                       </tr>
                     )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    );
  };

  const TokenExplorerView = () => {
    const [selectedToken, setSelectedToken] = useState<any>(null);
  
    const tokens = [
      { symbol: 'ARG', name: 'Argus Protocol', price: '$0.50', change: '---', marketCap: `$${((netStats?.totalMined || 0) * 0.5).toLocaleString()}`, holders: netStats?.totalUsers?.toLocaleString() || '---', supply: '1B', contract: '0xkernel_main' }
    ];
  
    if (selectedToken) {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <button onClick={() => setSelectedToken(null)} className="flex items-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
            <ArrowRight className="w-3 h-3 rotate-180" /> Back_To_Ledger
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-maroon/10 rounded-2xl flex items-center justify-center font-black text-maroon text-2xl italic border border-maroon/20">{selectedToken.symbol[0]}</div>
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedToken.name} <span className="text-zinc-700 not-italic">({selectedToken.symbol})</span></h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={BADGE_MAROON}>CONTRACT: {selectedToken.contract}</span>
                  <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{selectedToken.price} ({selectedToken.change})</span>
                </div>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {[
              { label: 'Market_Cap', val: selectedToken.marketCap, icon: TrendingUp },
              { label: 'Total_Supply', val: selectedToken.supply, icon: Database },
              { label: 'Unique_Holders', val: selectedToken.holders, icon: User },
              { label: 'Transfers_24H', val: '1,420', icon: Activity }
            ].map((stat, i) => (
              <div key={i} className={PANEL_GLASS + " p-6 space-y-2"}>
                 <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{stat.label}</p>
                 <p className="text-xl font-black text-white tracking-tight">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
  
    return (
       <div className="space-y-10 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">Protocol_Asset_Registry</h2>
               <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Security_Audit_Status: Verified</p>
            </div>
          </div>
  
          <div className={PANEL_GLASS}>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                     <tr className="text-[9px] text-zinc-700 font-black uppercase tracking-widest border-b border-white/5">
                       <th className="px-8 py-5">Asset_Ticker</th>
                       <th className="px-8 py-5 text-right">Oracle_Price</th>
                       <th className="px-8 py-5 text-right font-black">Mark_Cap</th>
                       <th className="px-8 py-5 text-right">Operators</th>
                       <th className="px-8 py-5 text-right">Circulating</th>
                       <th className="px-8 py-5"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-white/[0.02]">
                     {tokens.map((token, i) => (
                        <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-9 h-9 bg-maroon/10 rounded-xl flex items-center justify-center font-black text-maroon italic text-sm border border-maroon/20 group-hover/row:scale-110 transition-transform">{token.symbol[0]}</div>
                                 <div>
                                    <p className="text-xs font-black text-white uppercase italic">{token.name}</p>
                                    <p className="text-[9px] font-mono text-zinc-600 group-hover/row:text-maroon transition-colors">{token.symbol}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right font-black text-white text-xs tracking-tight">{token.price}</td>
                           <td className="px-8 py-5 text-right font-black text-zinc-400 text-xs tracking-tighter">{token.marketCap}</td>
                           <td className="px-8 py-5 text-right font-black text-zinc-500 text-xs tracking-widest">{token.holders}</td>
                           <td className="px-8 py-5 text-right">
                              <span className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">{token.supply}</span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button onClick={() => setSelectedToken(token)} className="px-4 py-1.5 bg-zinc-900 border border-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all">Registry_Info</button>
                           </td>
                        </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    );
  };

  // --- DATA SUB ---
  useEffect(() => {
    const unsubStats = subscribeToNetworkStats(setNetStats);
    const unsubNodes = subscribeToActiveMinerCount(setActiveNodes);
    
    // Recent Blocks Mock/Sim (using block height)
    const currentHeight = calculateCurrentBlockHeight();
    const mockBlocks = Array.from({ length: 10 }).map((_, i) => ({
      height: currentHeight - i,
      hash: ArgusSynapseService.generateAddress(`block-${currentHeight - i}`),
      miner: ArgusSynapseService.generateAddress(`miner-${(currentHeight - i) % 5}`),
      txCount: Math.floor((currentHeight - i) % 15) + (i === 0 ? 3 : 0),
      reward: BASE_MINING_RATE,
      timestamp: Date.now() - (i * AVG_BLOCK_TIME_MS)
    }));
    setRecentBlocks(mockBlocks);

    // Recent Transactions
    const q = query(collection(db, 'wallet_transactions'), orderBy('createdAt', 'desc'), limit(15));
    const unsubTxs = onSnapshot(q, (snapshot) => {
      setRecentTxs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubStats(); unsubNodes(); unsubTxs(); };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
     setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const searchStr = searchQuery.trim().toLowerCase();
      
      // Logic to determine if search is Hash, Block, Address, ENS, or Token
      if (searchStr.startsWith('0x') && searchStr.length > 50) {
        setSearchResult({ type: 'tx', data: { hash: searchQuery, status: 'CONFIRMED', chain: 'ARG' } });
      } else if (!isNaN(Number(searchStr))) {
        setSearchResult({ type: 'block', data: { height: Number(searchStr) } });
      } else if (searchStr.startsWith('arg') || (searchStr.startsWith('0x') && searchStr.length === 42)) {
        // Real Address Lookup
        getDocs(query(collection(db, 'users'))).then(snapshot => {
           const found = snapshot.docs.find(d => {
             const data = d.data() as any;
             return d.id === searchQuery || data.displayName === searchQuery || data.referralCode === searchQuery.toUpperCase();
           });
           
           if (found) {
              setSearchResult({ type: 'address', data: { address: found.id, ...(found.data() as any) } });
           } else {
              setSearchResult({ type: 'address', data: { address: searchQuery, points: 0, label: 'UNREGISTERED_IDENTITY' } });
           }
        });
      } else if (searchStr.endsWith('.ens') || searchStr.endsWith('.arg')) {
        setSearchResult({ type: 'address', data: { address: 'arg1...ens_resolved', label: searchStr } });
      } else if (searchStr.length < 6) {
        // Token ticker search
        setSearchResult({ type: 'token', data: { symbol: searchStr.toUpperCase(), name: 'Argus Asset' } });
      } else {
        // General search leads to dashboard/stats for now
        setActiveTab('dashboard');
        setSearchResult(null);
      }
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#020202] text-zinc-300 font-mono selection:bg-maroon selection:text-white pt-32 pb-40 px-6 overflow-hidden">
      <SEO title="ArgusScan | Terminal Explorer" description="Real-time blockchain exploration terminal for Argus Protocol." />
      
      {/* BACKGROUND SCENE */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <MatrixBackground color="rgba(128, 0, 0, 0.08)" opacity={0.1} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-maroon/[0.02] to-transparent"></div>
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-maroon/20 to-transparent"></div>
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10 space-y-12">
        
        {/* HEADER & UNIVERSAL SEARCH */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-maroon/5 border border-maroon/10 rounded-full">
                <Shield className="w-3.5 h-3.5 text-maroon animate-pulse" />
                <span className="text-[9px] font-black text-maroon uppercase tracking-[0.3em] italic">Protocol_Security_Audit_Active</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none italic group">
                Argus<span className="text-maroon group-hover:text-white transition-all duration-700">Scan.</span>
              </h1>
              <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em] max-w-xl opacity-60">
                The authoritative multi-layered explorer for the Argus high-throughput economy.
              </p>
            </div>
            
            <div className="w-full max-w-2xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-maroon/20 via-transparent to-maroon/20 blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <form onSubmit={handleSearch} className="relative flex items-center bg-black/80 border border-white/[0.05] rounded-2xl overflow-hidden focus-within:border-maroon/40 transition-all shadow-2xl">
                <Search className="w-5 h-5 ml-6 text-zinc-700" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="QUERY_TX_HASH / BLOCK / ADDRESS / TOKEN / PROTOCOL..." 
                  className="w-full bg-transparent border-none text-white px-6 py-6 font-mono text-xs tracking-widest uppercase outline-none placeholder:text-zinc-800"
                />
                <button type="submit" className="h-full px-8 bg-zinc-900 border-l border-white/5 text-zinc-500 hover:bg-maroon hover:text-white transition-all uppercase font-black text-[10px] tracking-widest">
                  {isSearching ? 'SCANN_ACTIVE...' : 'SCANN'}
                </button>
              </form>
            </div>
          </div>

          {/* NETWORK SNAPSHOT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Network_Block_Height', val: `#${recentBlocks[0]?.height?.toLocaleString() || '---'}`, icon: Box, color: 'text-maroon' },
              { label: 'Argus_Gas_Price', val: '4.2 Gwei', sub: 'Low Priority: 2.1', icon: Zap, color: 'text-emerald-500' },
              { label: 'Active_Kernel_Nodes', val: activeNodes.toLocaleString(), icon: Share2, color: 'text-blue-500' },
              { label: 'Arg_Market_Cap', val: `$${((netStats?.totalMined || 0) * 0.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-white' }
            ].map((stat, i) => (
              <div key={i} className={PANEL_GLASS + " p-6 flex items-center justify-between"}>
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest leading-none">{stat.label}</p>
                  <p className={`text-xl font-black ${stat.color} tracking-tighter`}>{stat.val}</p>
                  {stat.sub && <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">{stat.sub}</p>}
                </div>
                <div className="w-10 h-10 bg-zinc-900/50 rounded-xl flex items-center justify-center border border-white/5">
                  <stat.icon className={`w-5 h-5 ${stat.color} opacity-40`} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AGENTS / ENTITY NAV */}
        <div className="flex flex-wrap gap-4 items-center justify-start border-b border-white/[0.05] pb-6">
          {[
            { id: 'dashboard', label: 'Terminal', icon: Terminal },
            { id: 'blocks', label: 'Chains', icon: Box },
            { id: 'txs', label: 'Transmissions', icon: Activity },
            { id: 'tokens', label: 'Assets', icon: Database },
            { id: 'nfts', label: 'Collectibles', icon: Grid },
            { id: 'gas', label: 'Oracle', icon: Zap },
            { id: 'mempool', label: 'Pending', icon: List },
            { id: 'contracts', label: 'Registry', icon: Code },
            { id: 'tools', label: 'Arsenal', icon: PenTool }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-maroon text-white shadow-2xl shadow-maroon/20 translate-y-[-2px]' : 'text-zinc-600 hover:text-white hover:bg-zinc-900'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* DYNAMIC CONTENT TERMINAL */}
        <section>
          <AnimatePresence mode="wait">
            {searchResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <button 
                  onClick={() => setSearchResult(null)}
                  className="flex items-center gap-2 text-[10px] font-black text-zinc-600 hover:text-white transition-all uppercase tracking-widest"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Return_To_Terminal
                </button>

                {searchResult.type === 'tx' && <TransactionView data={searchResult.data} />}
                {searchResult.type === 'block' && <BlockView data={searchResult.data} />}
                {searchResult.type === 'address' && <AddressView data={searchResult.data} />}
              </motion.div>
            ) : (
              <motion.div key="tabs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                {activeTab === 'dashboard' && <DashboardTerminal recentBlocks={recentBlocks} recentTxs={recentTxs} shortenHash={shortenHash} formatTime={formatTime} />}
                {activeTab === 'blocks' && <BlockView data={{ height: recentBlocks[0]?.height }} />}
                {activeTab === 'txs' && <MempoolView />}
                {activeTab === 'tokens' && <TokenExplorerView />}
                {activeTab === 'nfts' && <NFTExplorerView />}
                {activeTab === 'gas' && <GasTrackerView />}
                {activeTab === 'mempool' && <MempoolView />}
                {activeTab === 'contracts' && <ContractExplorerView />}
                {activeTab === 'tools' && <ToolsView />}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ANALYTICS SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className={PANEL_GLASS + " p-8 space-y-6"}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Protocol_Throughput_24H</p>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-black text-emerald-500">+12.4%</div>
              </div>
              <div className="h-40 flex items-end gap-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div 
                     key={i} 
                     initial={{ height: 0 }}
                     animate={{ height: `${20 + ((netStats?.activeNodes || 0) + i * 7) % 80}%` }}
                     className="flex-1 bg-gradient-to-t from-maroon/20 to-maroon/60 rounded-t-sm"
                    />
                  ))}
              </div>
           </div>
           
           <div className={PANEL_GLASS + " p-8 flex flex-col justify-center gap-6"}>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Synchronized_Validators</p>
                <p className="text-4xl font-black text-white tracking-tighter italic">99.98<span className="text-zinc-700">%</span></p>
              </div>
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '99.98%' }} className="h-full bg-maroon shadow-[0_0_15px_rgba(128,0,0,0.5)] transition-all duration-1000" />
              </div>
              <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Operational parity across all shard sectors.</p>
           </div>

           <div className={PANEL_GLASS + " p-8 space-y-6"}>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Asset_Distribution</p>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full border-[6px] border-maroon relative flex items-center justify-center">
                   <div className="absolute inset-0 border-[6px] border-zinc-900 border-t-transparent -rotate-45" />
                   <p className="text-xs font-black text-white">40%</p>
                </div>
                <div className="space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-maroon" />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Mining_Rewards</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-zinc-800" />
                      <p className="text-[9px] text-zinc-600 font-bold uppercase">Circulating</p>
                   </div>
                </div>
              </div>
           </div>
        </section>

      </div>

      {/* FOOTER ADVISORY */}
      <div className="max-w-[1600px] mx-auto mt-20 p-8 border border-white/[0.03] bg-zinc-950/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
         <div className="flex items-center gap-6">
            <ArgusLogo className="w-8 h-8 text-maroon" />
            <div>
               <p className="text-[11px] font-black text-white uppercase tracking-widest leading-none">Argus_Protocol_Scan_Terminal</p>
               <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-wider mt-1.5 leading-none italic">Institutional Execution Monitoring. All Transmissions Enforced by Consensus.</p>
            </div>
         </div>
         <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Protocol_Uptime</p>
               <p className="text-xs font-black text-emerald-500">99.9999%</p>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="text-right">
               <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Build_Sequence</p>
               <p className="text-xs font-black text-white">v2.8.1_STABLE</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const DataUnavailable = ({ view }: { view: string }) => (
  <div className="py-40 text-center silk-panel !bg-black/40 rounded-[3rem] border-dashed border-zinc-900/50">
    <div className="w-20 h-20 bg-maroon/5 rounded-3xl border border-maroon/10 flex items-center justify-center mx-auto mb-6">
      <Database className="w-8 h-8 text-maroon/20" />
    </div>
    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 italic">{view}_Offline</h3>
    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
      This sector is currently undergoing architectural refinement. Full on-chain indexing will resume briefly.
    </p>
  </div>
);

export default ArgusScan;
