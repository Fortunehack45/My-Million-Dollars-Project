import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Share2, Users, ShieldCheck } from 'lucide-react';

const Referrals = () => {
  const { user } = useAuth();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = () => {
    if (!user) return;
    const link = `${window.location.origin}/#/?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Peer Network</h1>
        <p className="text-zinc-500 text-sm font-medium">Expand the network topology to earn infrastructure commission.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface p-10 rounded-3xl space-y-10">
          <div className="flex items-center gap-4">
            <Share2 className="w-5 h-5 text-primary" />
            <h3 className="label-meta text-zinc-300">Auth Link</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex items-center justify-between">
              <code className="text-zinc-500 font-mono text-[10px] font-bold">.../?ref={user.referralCode}</code>
              <button onClick={copyToClipboard} className="btn-secondary !py-2 !px-4 !text-[9px]">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 font-medium italic">Commission Rate: 10% of peer yield</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="surface p-8 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <Users className="w-4 h-4 text-zinc-600" />
               <p className="label-meta">Connected Nodes</p>
            </div>
            <span className="text-3xl font-mono font-bold text-white">{user.referralCount}</span>
          </div>

          <div className="surface p-8 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
               <ShieldCheck className="w-4 h-4 text-zinc-600" />
               <p className="label-meta">Commission Accrued</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-bold text-primary">0.00</span>
              <span className="ml-2 label-meta tracking-normal">NEX</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;