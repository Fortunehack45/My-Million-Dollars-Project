import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createInitialProfile, validateReferralCode } from '../services/firebase';
import { 
  Fingerprint, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  Cpu,
  Loader2
} from 'lucide-react';

const ProfileSetup = () => {
  const { firebaseUser, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !username) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate referral code if provided
      let referrerUid = null;
      if (refCode.trim()) {
        referrerUid = await validateReferralCode(refCode.trim());
        if (!referrerUid) {
          setError("PEER_HANDSHAKE_FAILED: Invalid referral code.");
          setIsSubmitting(false);
          return;
        }
      }

      const profile = await createInitialProfile(firebaseUser, username, referrerUid);
      refreshUser(profile);
    } catch (err: any) {
      setError("CRITICAL_SYSTEM_ERROR: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        <header className="space-y-4 text-center">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4">
             <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Identity_Setup</h1>
          <p className="label-meta text-zinc-500">Initialize operator credentials for the Nexus network</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Username Input */}
            <div className="space-y-2">
              <label className="label-meta text-[10px] block pl-1">Assign_Handle *</label>
              <div className="relative group">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-primary transition-colors" />
                <input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="Operator_Name"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-white font-mono text-sm py-4 pl-12 pr-4 rounded-xl transition-all outline-none"
                />
              </div>
              <p className="text-[9px] text-zinc-600 font-mono pl-1 uppercase">A-Z, 0-9, and underscores allowed</p>
            </div>

            {/* Referral Input */}
            <div className="space-y-2">
              <label className="label-meta text-[10px] block pl-1">Peer_Referral_Code (Optional)</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-primary transition-colors" />
                <input 
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="ARG-XXXXX"
                  className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-primary/50 text-white font-mono text-sm py-4 pl-12 pr-4 rounded-xl transition-all outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[10px] font-mono font-bold text-primary uppercase">{error}</p>
            </div>
          )}

          <button 
            disabled={isSubmitting || !username}
            className={`btn-primary w-full flex items-center justify-center gap-3 relative overflow-hidden ${isSubmitting || !username ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="tracking-[0.2em]">Processing_Handshake</span>
              </>
            ) : (
              <>
                <span className="tracking-[0.2em]">Establish_Presence</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <footer className="pt-6 border-t border-zinc-900">
           <div className="flex justify-between items-center text-[8px] font-mono text-zinc-700 uppercase font-bold tracking-widest">
              <div className="flex items-center gap-2">
                 <Cpu className="w-3 h-3" />
                 <span>Layer_2_Identity</span>
              </div>
              <span>Protocol_Handshake_v2</span>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default ProfileSetup;