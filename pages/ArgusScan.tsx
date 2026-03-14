import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Box, Activity, ArrowRight, Clock, Hash, 
  User, Database, Zap, Shield, Globe, Terminal,
  TrendingUp, Layers, Cpu, Share2, Grid, List,
  ArrowUpRight, ArrowDownLeft, FileText, Code,
  Eye, PenTool, BarChart3, Bell, Tag, Info,
  ExternalLink, ChevronRight, Filter, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  subscribeToNetworkStats, 
  subscribeToAllTransactions, 
  calculateCurrentBlockHeight,
  subscribeToActiveMinerCount,
  db
} from '../services/firebase';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { NetworkStats } from '../types';
import MatrixBackground from '../components/MatrixBackground';
import SEO from '../components/SEO';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { ArgusLogo } from '../components/ArgusLogo';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

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

const TransactionView = ({ data }: { data: any }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Transaction_Payload_Manifest</h2>
        <div className="flex items-center gap-4">
          <span className={BADGE_MAROON}>TX_HASH: {data.hash}</span>
          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded">{data.status}</span>
        </div>
      </div>
      <div className="flex gap-4">
         <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">
            <Share2 className="w-3 h-3" /> Share_Tx
         </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className={PANEL_GLASS + " lg:col-span-2 p-8 space-y-10"}>
         <div className="grid grid-cols-2 gap-12">
            {[
              { label: 'Origin_Vector', val: shortenHash(data.from || 'arg...'), sub: 'Consensus_Verified' },
              { label: 'Destination_Target', val: shortenHash(data.to || 'arg...'), sub: 'Registry_Confirmed' },
              { label: 'Transmission_Value', val: '12.4500 ARG', sub: '≈ $1,245.00 USD' },
              { label: 'Network_Fee_Burn', val: '0.00042 ARG', sub: 'Priority_Processing' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.label}</p>
                <p className="text-lg font-black text-white tracking-tight">{item.val}</p>
                <p className="text-[8px] text-zinc-700 font-bold tracking-widest">{item.sub}</p>
              </div>
            ))}
         </div>
         
         <div className="space-y-4 pt-10 border-t border-white/[0.03]">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3">
              <Terminal className="w-3.5 h-3.5" /> Data_Payload_Hex
            </p>
            <div className="bg-black/80 rounded-2xl p-6 font-mono text-[10px] text-zinc-500 break-all border border-white/[0.03]">
              0x6a401c4078816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c21a415951d41864f1c4078816c2...
            </div>
         </div>
      </div>

      <div className="space-y-8">
         <div className={PANEL_GLASS + " p-8"}>
            <p className="text-[10px] font-black text-white uppercase tracking-widest mb-6">Processing_Metrics</p>
            <div className="space-y-6">
               <MetricRow label="Block_Height" val="#4,821,093" />
               <MetricRow label="Confirmations" val="12" icon={Shield} color="text-emerald-500" />
               <MetricRow label="Gas_Limit" val="21,000" />
               <MetricRow label="Gas_Usage" val="21,000 (100%)" />
               <MetricRow label="Processing_Time" val="0.4s" />
            </div>
         </div>
         <div className={PANEL_GLASS + " p-8 bg-maroon/[0.02] border-maroon/10"}>
            <p className="text-[10px] font-black text-maroon uppercase tracking-widest mb-4">Internal_State_Changes</p>
            <p className="text-[9px] text-zinc-600 font-medium leading-relaxed">
              Consensus achieved in Shard 4. State root updated successfully at index 0x42f.
            </p>
         </div>
      </div>
    </div>
  </div>
);

const BlockView = ({ data }: { data: any }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Ledger_Registry_Segment</h2>
        <div className="flex items-center gap-4">
          <span className={BADGE_MAROON}>BLOCK_HEIGHT: #{data.height}</span>
          <span className={BADGE_ZINC}>TIMESTAMP: {new Date().toUTCString()}</span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {[
        { label: 'Block_Hash', val: shortenHash('0x4af...210'), icon: Hash },
        { label: 'Validator_Node', val: shortenHash('arg...miner'), icon: Cpu },
        { label: 'Total_Transmissions', val: '42 Operations', icon: Activity },
        { label: 'Block_Reward', val: '0.0600 ARG', icon: Zap }
      ].map((item, i) => (
        <div key={i} className={PANEL_GLASS + " p-6 space-y-3"}>
          <div className="flex items-center justify-between">
            <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.label}</p>
            <item.icon className="w-4 h-4 text-zinc-800" />
          </div>
          <p className="text-lg font-black text-white tracking-tight">{item.val}</p>
        </div>
      ))}
    </div>

    <div className={PANEL_GLASS}>
      <div className="px-8 py-6 border-b border-white/[0.03] bg-black/40">
        <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Included_Transmissions</p>
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
            {[1, 2, 3, 4, 5].map(i => (
              <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                <td className="py-4 font-mono text-xs text-maroon font-bold">{shortenHash('0xabc...')}</td>
                <td className="py-4 font-mono text-xs text-zinc-500">{shortenHash('arg1...')}</td>
                <td className="py-4 font-mono text-xs text-zinc-500">{shortenHash('arg2...')}</td>
                <td className="py-4 font-black text-white text-right text-xs">{(Math.random() * 10).toFixed(4)} ARG</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AddressView = ({ data }: { data: any }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
     <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Identity_Protocol_Matrix</h2>
        <div className="flex items-center gap-4">
          <span className={BADGE_MAROON}>ADDRESS: {data.address}</span>
          <span className={BADGE_ZINC}>IDENTITY_STATUS: VERIFIED</span>
        </div>
      </div>
      <div className="flex gap-4">
         <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all shadow-2xl">
            <PenTool className="w-4 h-4" /> Message_Identity
         </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className={PANEL_GLASS + " p-8 space-y-10"}>
          <div className="space-y-2">
            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Total_Capital_Balance</p>
            <p className="text-4xl font-black text-white tracking-tighter italic">42,000.42 <span className="text-maroon text-2xl font-mono">ARG</span></p>
            <p className="text-xs font-bold text-zinc-700 uppercase tracking-widest">≈ $4,200,042.00 USD</p>
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
                <TokenHoldingRow symbol="ARG" name="Argus Protocol" balance="42,000" val="$4.2M" />
                <TokenHoldingRow symbol="USDC" name="Argus USD" balance="1,200" val="$1,200" />
                <TokenHoldingRow symbol="SHARD" name="Network Shard" balance="8" val="Priceless" />
             </div>
          </div>
       </div>

       <div className={PANEL_GLASS + " lg:col-span-2 flex flex-col"}>
          <div className="flex items-center border-b border-white/[0.05]">
             {['Activity', 'History', 'Analytics', 'Protocol_Access'].map(tab => (
               <button key={tab} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white border-b-2 border-transparent hover:border-maroon/40 transition-all">{tab}</button>
             ))}
          </div>
          <div className="p-8 flex-grow">
             <div className="space-y-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex items-center justify-between p-5 bg-black/40 border border-white/[0.02] rounded-2xl hover:border-maroon/20 transition-all group/item cursor-pointer">
                     <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-maroon/10 text-maroon'} border border-white/5`}>
                           {i % 2 === 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                           <p className="text-xs font-black text-white uppercase tracking-tight italic">{i % 2 === 0 ? 'Inbound_Transfer' : 'Outbound_Contract_Execution'}</p>
                           <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">2 hours ago | block #4,821,092</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-sm font-black tracking-tighter ${i % 2 === 0 ? 'text-emerald-500' : 'text-white'}`}>{i % 2 === 0 ? '+' : '-'}{ (Math.random() * 100).toFixed(2) } ARG</p>
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
     <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
          <Zap className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em]">Network_Priority_Oracle_Active</span>
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Transmission_Cost_Oracle</h2>
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em]">Real-time prioritization metrics for the Argus high-throughput kernel.</p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Low_Priority', val: '1.2 Gwei', time: '~ 5 mins', color: 'text-zinc-500' },
          { label: 'Standard_Execution', val: '4.2 Gwei', time: '~ 1 min', color: 'text-white' },
          { label: 'High_Priority', val: '8.5 Gwei', time: '< 15s', color: 'text-maroon' }
        ].map((item, i) => (
          <div key={i} className={PANEL_GLASS + " p-10 space-y-4 text-center"}>
             <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest">{item.label}</p>
             <p className={`text-5xl font-black tracking-tighter ${item.color}`}>{item.val}</p>
             <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest italic">{item.time}</p>
          </div>
        ))}
     </div>

     <div className={PANEL_GLASS + " p-10"}>
        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-10 flex items-center gap-4">
           <TrendingUp className="w-4 h-4 text-maroon" /> Estimated_Operation_Costs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
           {[
             { op: 'Address_Transfer', cost: '$0.0042', gas: '21,000' },
             { op: 'Asset_Minting', cost: '$1.24', gas: '120,400' },
             { op: 'Smart_Registry_Write', cost: '$0.85', gas: '85,000' },
             { op: 'Liquid_Swap', cost: '$2.10', gas: '210,000' }
           ].map((item, i) => (
             <div key={i} className="space-y-2">
                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">{item.op}</p>
                <p className="text-xl font-black text-white tracking-tight">{item.cost}</p>
                <p className="text-[8px] text-zinc-800 font-bold uppercase tracking-widest">Est_Gas: {item.gas}</p>
             </div>
           ))}
        </div>
     </div>
  </div>
);

const MempoolView = () => (
  <div className="space-y-8 animate-in fade-in duration-700">
     <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Pending_Transmission_Pool</h2>
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">642 Transmissions awaiting consensus validation.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-maroon animate-ping" />
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">LIVE_SURVEILLANCE</span>
           </div>
        </div>
     </div>

     <div className={PANEL_GLASS}>
        <div className="p-8">
           <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] text-zinc-700 font-black uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4">TXN_ID</th>
                  <th className="pb-4">Source</th>
                  <th className="pb-4 text-center">Gas_Price</th>
                  <th className="pb-4 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {[...Array(12)].map((_, i) => (
                  <tr key={i} className="group/row hover:bg-white/[0.01] transition-all">
                    <td className="py-5 font-mono text-xs text-maroon font-bold opacity-60 group-hover/row:opacity-100 transition-opacity italic">0x{Math.random().toString(16).slice(2, 10)}...</td>
                    <td className="py-5 font-mono text-xs text-zinc-500">arg{Math.random().toString(36).slice(2, 20)}</td>
                    <td className="py-5 text-center text-[10px] font-black text-white tracking-widest">{ (Math.random() * 5 + 1).toFixed(1) } Gwei</td>
                    <td className="py-5 font-black text-white text-right text-xs">{(Math.random() * 50).toFixed(2)} ARG</td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
     </div>
  </div>
);

const TokenExplorerView = () => (
  <div className="space-y-12 animate-in fade-in duration-700">
     <div className={PANEL_GLASS + " p-12 text-center space-y-6"}>
        <div className="w-24 h-24 bg-maroon/5 rounded-[2rem] border border-maroon/10 flex items-center justify-center mx-auto">
           <Database className="w-10 h-10 text-maroon" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Multi-Asset_Ledger</h2>
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em]">Audit all ERC-20 compliant tokens orbiting the Argus kernel.</p>
     </div>
     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2, 3, 4].map(idx => (
           <div key={idx} className={PANEL_GLASS + " p-8 flex items-center justify-between hover:border-maroon/20 transition-all cursor-pointer"}>
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-maroon text-xl italic">{idx === 1 ? 'A' : idx === 2 ? 'U' : 'X'}</div>
                 <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight italic">{idx === 1 ? 'Argus Protocol' : idx === 2 ? 'Argus USD' : 'Synthetic Asset'}</h4>
                    <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest mt-1">Market Cap: $42.5M | Holders: 12,402</p>
                 </div>
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-800" />
           </div>
        ))}
     </div>
  </div>
);

const NFTExplorerView = () => (
   <div className="space-y-12 animate-in fade-in duration-700">
     <div className={PANEL_GLASS + " p-12 text-center space-y-6"}>
        <div className="w-24 h-24 bg-maroon/5 rounded-[2rem] border border-maroon/10 flex items-center justify-center mx-auto">
           <Grid className="w-10 h-10 text-maroon" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Collectible_Nexus</h2>
        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.4em]">Visualizing unique digital artifacts secured by the Shard network.</p>
     </div>
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
           <div key={idx} className={PANEL_GLASS + " aspect-square group/nft cursor-pointer"}>
              <div className="h-2/3 bg-zinc-900 flex items-center justify-center overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-br from-maroon/20 to-zinc-900 group-hover/nft:scale-110 transition-transform duration-700 flex items-center justify-center flex-col gap-2">
                    <Grid className="w-8 h-8 text-zinc-800 group-hover/nft:text-maroon transition-colors" />
                    <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">NFT_ARTIFACT_{idx}</span>
                 </div>
              </div>
              <div className="p-4 space-y-1">
                 <p className="text-[9px] font-black text-white uppercase">Argus_Genesis #{idx}</p>
                 <p className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">v2_Collection_Ref</p>
              </div>
           </div>
        ))}
     </div>
  </div>
);

// --- MAIN ARYUS SCAN COMPONENT ---
const ArgusScan = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blocks' | 'txs' | 'tokens' | 'nfts' | 'gas' | 'mempool'>('dashboard');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeNodes, setActiveNodes] = useState(0);

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
      txCount: 5 + Math.floor(Math.random() * 20),
      reward: 0.06,
      timestamp: Date.now() - (i * 400)
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
    // Simulate lookup
    setTimeout(() => {
      setIsSearching(false);
      // Logic to determine if search is Hash, Block, or Address
      if (searchQuery.length > 50) {
        setSearchResult({ type: 'tx', data: { hash: searchQuery, status: 'CONFIRMED' } });
      } else if (!isNaN(Number(searchQuery))) {
        setSearchResult({ type: 'block', data: { height: Number(searchQuery) } });
      } else if (searchQuery.startsWith('arg')) {
        setSearchResult({ type: 'address', data: { address: searchQuery } });
      } else {
        // Fallback or specific lookup for tokens/nfts
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
            { id: 'mempool', label: 'Pending', icon: List }
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
                 {[40, 60, 45, 80, 55, 90, 70, 100, 85, 110].map((h, i) => (
                   <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
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
