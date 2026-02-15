import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mintNFT } from '../services/firebase';
import { Hexagon, ShieldCheck, Cpu, HardDrive, Zap, Info, ArrowRight, Lock } from 'lucide-react';

const MINT_COST = 500;

const NFTSection = () => {
  const { user, refreshUser } = useAuth();
  const [isMinting, setIsMinting] = useState(false);
  const [mintStep, setMintStep] = useState(0);

  const handleMint = async () => {
    if (!user || user.points < MINT_COST || user.ownedNFT) return;

    setIsMinting(true);
    
    // Technical sequence simulation
    const steps = ['HANDSHAKE_INIT', 'ALLOCATING_BLOCK', 'ENCRYPTING_METADATA', 'FINALIZING_MINT'];
    for (let i = 0; i < steps.length; i++) {
      setMintStep(i + 1);
      await new Promise(r => setTimeout(r, 1200));
    }

    const success = await mintNFT(user.uid, MINT_COST);
    if (success) {
      refreshUser({ ...user, points: user.points - MINT_COST, ownedNFT: true });
    }
    setIsMinting(false);
    setMintStep(0);
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Authority Assets</h1>
        <p className="text-zinc-500 text-sm font-medium">Acquire Genesis credentials to elevate your node's infrastructure priority.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Asset Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="surface p-1 relative rounded-3xl overflow-hidden group">
            <div className="bg-zinc-950 aspect-[4/5] rounded-[1.4rem] p-10 flex flex-col justify-between relative overflow-hidden">
              {/* Background Technical Grid */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="grid grid-cols-8 h-full w-full">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="border-r border-white h-full"></div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  <Hexagon className={`w-6 h-6 ${user.ownedNFT ? 'text-primary' : 'text-zinc-700'}`} />
                </div>
                <div className="text-right">
                  <p className="label-meta text-zinc-600">Series</p>
                  <p className="text-xs font-mono font-bold text-white">GENESIS_A</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-12">
                 <div className="relative">
                    <div className={`w-40 h-40 border-2 ${user.ownedNFT ? 'border-primary/20' : 'border-zinc-800'} rounded-full flex items-center justify-center`}>
                       <Cpu className={`w-16 h-16 ${user.ownedNFT ? 'text-primary shadow-[0_0_30px_rgba(244,63,94,0.3)]' : 'text-zinc-800'} transition-all duration-700`} />
                    </div>
                    {user.ownedNFT && (
                      <div className="absolute inset-0 w-40 h-40 border border-primary rounded-full animate-ping opacity-20"></div>
                    )}
                 </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div>
                   <p className="label-meta text-primary">Credential</p>
                   <h3 className="text-2xl font-black text-white tracking-tight italic uppercase">
                     {user.ownedNFT ? `Nexus_Op_#${user.uid.slice(0, 4)}` : 'Node_Identity_Locked'}
                   </h3>
                </div>
                <div className="flex gap-2">
                   <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-mono text-zinc-500 uppercase">Class: S-Rank</span>
                   <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 text-[8px] font-mono text-zinc-500 uppercase">Yield: +20%</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="surface p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-zinc-600" />
              <p className="label-meta">Global Availability</p>
            </div>
            <p className="text-xs font-mono font-bold text-white">1,024 / 5,000</p>
          </div>
        </div>

        {/* Right Col: Control Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="surface p-12 rounded-3xl h-full flex flex-col justify-between">
            <div className="space-y-12">
              <div className="space-y-4">
                <p className="label-meta text-zinc-500">Acquisition Protocol</p>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight italic">
                  Finalize your node authority
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
                  Genesis Assets authenticate your presence on the testnet. Holders receive a sustained <span className="text-primary font-bold">1.2x multiplier</span> on all data contribution points and priority access to Phase 2 governance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-6 bg-zinc-900/50 border border-zinc-900 rounded-2xl space-y-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black text-zinc-300 uppercase">Compute Multiplier</h4>
                    <p className="text-[11px] text-zinc-500 leading-tight">Permanent yield acceleration across all future epochs.</p>
                 </div>
                 <div className="p-6 bg-zinc-900/50 border border-zinc-900 rounded-2xl space-y-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-[10px] font-black text-zinc-300 uppercase">Governance Token</h4>
                    <p className="text-[11px] text-zinc-500 leading-tight">Whitelisted access to the Nexus DAO treasury voting.</p>
                 </div>
              </div>
            </div>

            <div className="pt-12 border-t border-zinc-900 mt-12">
              {user.ownedNFT ? (
                <div className="flex items-center gap-4 text-emerald-500">
                  <ShieldCheck className="w-5 h-5" />
                  <p className="label-meta tracking-widest">Asset Authenticated in local vault</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="label-meta">Required Allocation</p>
                      <p className={`text-xl font-mono font-bold ${user.points < MINT_COST ? 'text-zinc-700' : 'text-white'}`}>
                        {MINT_COST} NEX
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="label-meta">Available Balance</p>
                      <p className="text-xl font-mono font-bold text-zinc-400">{Math.floor(user.points)} NEX</p>
                    </div>
                  </div>

                  {isMinting ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-1">
                        <p className="label-meta text-primary">Process::Step {mintStep}/4</p>
                        <p className="text-[10px] font-mono text-zinc-500 animate-pulse">EXECUTING_HASH...</p>
                      </div>
                      <div className="h-1 bg-zinc-900 w-full overflow-hidden rounded-full">
                        <div 
                          className="h-full bg-primary transition-all duration-500 ease-out" 
                          style={{ width: `${(mintStep / 4) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={handleMint}
                      disabled={user.points < MINT_COST}
                      className={`btn-primary w-full flex items-center justify-center gap-3 ${user.points < MINT_COST ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                    >
                      {user.points < MINT_COST ? 'Insufficient Credits' : 'Initialize Minting Sequence'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
        <div className="flex items-center gap-3">
          <HardDrive className="w-4 h-4" />
          <p className="text-[9px] font-mono font-bold uppercase">Asset_Type::ERC-721_Compatible</p>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <Lock className="w-4 h-4" />
          <p className="text-[9px] font-mono font-bold uppercase">Network::Nexus_Staging_V2</p>
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Zap className="w-4 h-4" />
          <p className="text-[9px] font-mono font-bold uppercase">Refreshed::Every_60S</p>
        </div>
      </div>
    </div>
  );
};

export default NFTSection;