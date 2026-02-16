import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/PublicLayout';
import { Search, Box, Activity, Clock, ChevronRight } from 'lucide-react';

const Explorer = () => {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock data
    const genBlock = (i: number) => ({
      number: 14000000 + i,
      hash: '0x' + Math.random().toString(16).slice(2),
      validator: 'Argus_Val_' + Math.floor(Math.random() * 100),
      txs: Math.floor(Math.random() * 200),
      time: 'Just now'
    });

    const genTx = () => ({
      hash: '0x' + Math.random().toString(16).slice(2),
      from: '0x' + Math.random().toString(16).slice(2, 10) + '...',
      to: '0x' + Math.random().toString(16).slice(2, 10) + '...',
      value: (Math.random() * 100).toFixed(4),
      time: 'Just now'
    });

    setBlocks(Array.from({ length: 6 }).map((_, i) => genBlock(i)));
    setTxs(Array.from({ length: 8 }).map(() => genTx()));

    const interval = setInterval(() => {
       setBlocks(prev => [genBlock(prev[0].number + 1), ...prev.slice(0, 5)]);
       setTxs(prev => [genTx(), ...prev.slice(0, 7)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PublicLayout>
       <div className="py-12 bg-zinc-950 border-b border-zinc-900">
          <div className="max-w-7xl mx-auto px-6">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Argus Explorer</h1>
             
             <div className="relative max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search by Address / Txn Hash / Block / Token"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-4 py-4 rounded-xl focus:border-primary/50 outline-none font-mono text-sm"
                />
             </div>
          </div>
       </div>

       <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
             <div className="surface p-6 rounded-xl">
                <p className="label-meta text-zinc-500">ARG Price</p>
                <p className="text-xl font-mono font-bold text-white">$4.20 <span className="text-emerald-500 text-xs">(+5.4%)</span></p>
             </div>
             <div className="surface p-6 rounded-xl">
                <p className="label-meta text-zinc-500">Market Cap</p>
                <p className="text-xl font-mono font-bold text-white">$842,000,000</p>
             </div>
             <div className="surface p-6 rounded-xl">
                <p className="label-meta text-zinc-500">Transactions</p>
                <p className="text-xl font-mono font-bold text-white">142.5M <span className="text-zinc-600 text-xs">(12.5 TPS)</span></p>
             </div>
             <div className="surface p-6 rounded-xl">
                <p className="label-meta text-zinc-500">Active Validators</p>
                <p className="text-xl font-mono font-bold text-white">24,102</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Blocks */}
             <div className="surface rounded-2xl overflow-hidden border border-zinc-900">
                <div className="p-6 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-center">
                   <h3 className="font-bold text-white">Latest Blocks</h3>
                   <button className="p-2 bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-zinc-900">
                   {blocks.map((block, i) => (
                      <div key={i} className="p-4 flex items-center gap-4 hover:bg-zinc-900/30 transition-colors">
                         <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center shrink-0 text-zinc-500">
                            <Box className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                               <span className="text-primary font-mono font-bold text-sm">{block.number}</span>
                               <span className="text-[10px] text-zinc-500">{block.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-xs text-zinc-400 truncate">Validated by {block.validator}</span>
                               <span className="text-[10px] border border-zinc-800 px-2 rounded text-zinc-500">{block.txs} txns</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* Txs */}
             <div className="surface rounded-2xl overflow-hidden border border-zinc-900">
                <div className="p-6 border-b border-zinc-900 bg-zinc-900/50 flex justify-between items-center">
                   <h3 className="font-bold text-white">Latest Transactions</h3>
                   <button className="p-2 bg-zinc-900 rounded border border-zinc-800 text-zinc-500 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <div className="divide-y divide-zinc-900">
                   {txs.map((tx, i) => (
                      <div key={i} className="p-4 flex items-center gap-4 hover:bg-zinc-900/30 transition-colors">
                         <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center shrink-0 text-zinc-500">
                            <Activity className="w-5 h-5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1">
                               <span className="text-white font-mono text-sm truncate w-32">{tx.hash}</span>
                               <span className="text-[10px] text-zinc-500">{tx.time}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="text-xs text-zinc-500 truncate">
                                  From <span className="text-primary">{tx.from}</span> To <span className="text-primary">{tx.to}</span>
                               </div>
                               <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-300 border border-zinc-800">{tx.value} ARG</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </PublicLayout>
  );
};

export default Explorer;