import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createInitialProfile, validateReferralCode, checkUsernameTaken, getUserData } from '../services/firebase';
import { 
  Fingerprint, 
  ArrowRight, 
  ShieldCheck, 
  Terminal, 
  AlertCircle,
  Loader2,
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="w-full max-w-md space-y-12 relative z-10">
        <header className="space-y-6 text-center">
          <div className="inline-flex p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-4 shadow-xl">
             <Fingerprint className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Identity_Setup</h1>
             <p className="text-zinc-500 text-sm font-medium">Initialize your unique operator credentials to access the network.</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/20 p-8 rounded-3xl border border-zinc-900 backdrop-blur-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Assign_Handle *</label>
                {checkingName && <Loader2 className="w-3 h-3 text-zinc-600 animate-spin" />}
                {!checkingName && isNameTaken === true && <span className="text-[9px] font-black text-primary uppercase tracking-wider">Unavailable</span>}
                {!checkingName && isNameTaken === false && <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">Available</span>}
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                   <Terminal className={`w-4 h-4 transition-colors ${isNameTaken === true ? 'text-primary' : isNameTaken === false ? 'text-emerald-500' : 'text-zinc-600 group-focus-within:text-white'}`} />
                </div>
                <input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="Operator_Handle"
                  className={`w-full bg-zinc-950/80 border text-white font-mono text-sm py-4 pl-12 pr-12 rounded-xl transition-all outline-none shadow-inner ${isNameTaken === true ? 'border-primary/50 focus:border-primary' : isNameTaken === false ? 'border-emerald-500/30 focus:border-emerald-500' : 'border-zinc-800 focus:border-white/20'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block px-1">Referral_Code (Optional)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                   <ShieldCheck className="w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  value={refCode}
                  onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                  placeholder="ARG-XXXXX"
                  className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-white/20 text-white font-mono text-sm py-4 pl-12 pr-4 rounded-xl transition-all outline-none uppercase shadow-inner placeholder:text-zinc-700"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] font-mono font-bold text-primary uppercase leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            disabled={isSubmitting || !username || isNameTaken !== false || username.length < 3}
            className={`w-full h-14 bg-primary text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 relative overflow-hidden transition-all duration-300 shadow-[0_10px_40px_rgba(244,63,94,0.2)] hover:shadow-[0_10px_60px_rgba(244,63,94,0.4)] active:scale-[0.98] ${isSubmitting || !username || isNameTaken !== false || username.length < 3 ? 'opacity-30 cursor-not-allowed grayscale shadow-none' : 'hover:bg-white hover:text-black'}`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="relative z-10">Establish_Presence</span>
                <ArrowRight className="w-4 h-4 relative z-10" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;