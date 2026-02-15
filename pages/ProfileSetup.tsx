import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createInitialProfile, validateReferralCode, checkUsernameTaken, getUserData } from '../services/firebase';
import { 
  Fingerprint, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  Cpu,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const ProfileSetup = () => {
  const { firebaseUser, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username.length < 3) {
      setIsNameTaken(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingName(true);
      try {
        const taken = await checkUsernameTaken(username);
        setIsNameTaken(taken);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingName(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !username || isNameTaken) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      let referrerUid = null;
      if (refCode.trim()) {
        referrerUid = await validateReferralCode(refCode.trim());
        if (!referrerUid) {
          setError("PEER_HANDSHAKE_FAILED: Invalid referral code.");
          setIsSubmitting(false);
          return;
        }
      }

      // Check one last time if they exist to avoid race conditions
      const preCheck = await getUserData(firebaseUser.uid);
      if (preCheck) {
        refreshUser(preCheck);
        return;
      }

      const profile = await createInitialProfile(firebaseUser, username, referrerUid);
      refreshUser(profile);
    } catch (err: any) {
      if (err.message === "USERNAME_TAKEN") {
        setError("CONFLICT: Handle claimed by another operator.");
        setIsNameTaken(true);
      } else if (err.message?.includes("permission")) {
        setError("SECURITY_FAULT: Database rules denied access. Verify Security Rules in Firebase Console.");
      } else {
        setError("CRITICAL_FAULT: " + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="w-full max-w-md space-y-10 relative z-10">
        <header className="space-y-4 text-center">
          <div className="inline-flex p-3 bg-zinc-900 border border-zinc-800 rounded-lg mb-4">
             <Fingerprint className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Identity_Setup</h1>
          <p className="label-meta text-zinc-500">Initialize unique operator credentials</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="label-meta text-[10px] block">Assign_Handle *</label>
                {checkingName && <Loader2 className="w-3 h-3 text-zinc-600 animate-spin" />}
                {!checkingName && isNameTaken === true && <span className="text-[8px] font-bold text-primary uppercase">Unavailable</span>}
                {!checkingName && isNameTaken === false && <span className="text-[8px] font-bold text-emerald-500 uppercase">Unique</span>}
              </div>
              <div className="relative group">
                <Terminal className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isNameTaken === true ? 'text-primary' : isNameTaken === false ? 'text-emerald-500' : 'text-zinc-700'}`} />
                <input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="Operator_Handle"
                  className={`w-full bg-zinc-900/50 border text-white font-mono text-sm py-4 pl-12 pr-12 rounded-xl transition-all outline-none ${isNameTaken === true ? 'border-primary/50' : isNameTaken === false ? 'border-emerald-500/30' : 'border-zinc-800 focus:border-primary/50'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="label-meta text-[10px] block pl-1">Peer_Referral_Code (Optional)</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700 group-focus-within:text-primary transition-colors" />
                <input 
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="NEX-XXXXX"
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
            disabled={isSubmitting || !username || isNameTaken !== false || username.length < 3}
            className={`btn-primary w-full flex items-center justify-center gap-3 relative overflow-hidden ${isSubmitting || !username || isNameTaken !== false || username.length < 3 ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="tracking-[0.2em]">Establish_Presence</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;