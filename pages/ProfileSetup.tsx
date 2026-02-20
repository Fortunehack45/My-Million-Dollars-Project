
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createInitialProfile, validateReferralCode, checkUsernameTaken, getUserData, getNetworkStats, DEFAULT_MAX_USERS_CAP } from '../services/firebase';
import {
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Terminal,
  AlertCircle,
  Loader2,
  Lock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const ProfileSetup = () => {
  const { firebaseUser, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [refCode, setRefCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNetworkCapped, setIsNetworkCapped] = useState<boolean>(false);
  const [loadingCap, setLoadingCap] = useState<boolean>(true);
  const [limitCount, setLimitCount] = useState<number>(DEFAULT_MAX_USERS_CAP);

  // Auto-fill referral code
  useEffect(() => {
    const savedRef = localStorage.getItem('referralCode');
    if (savedRef) {
      setRefCode(savedRef.toUpperCase());
    }
  }, []);

  // Check network capacity on mount
  useEffect(() => {
    const checkCap = async () => {
      try {
        const stats = await getNetworkStats();
        const limit = stats?.maxUsersCap || DEFAULT_MAX_USERS_CAP;
        setLimitCount(limit);
        if (stats && stats.totalUsers >= limit) {
          setIsNetworkCapped(true);
        }
      } catch (e) {
        console.error("Cap check failed", e);
      } finally {
        setLoadingCap(false);
      }
    };
    checkCap();
  }, []);

  // Debounced username check
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

    if (isNetworkCapped) {
      setError("Maximum network capacity reached.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let referrerUid = null;
      if (refCode.trim()) {
        referrerUid = await validateReferralCode(refCode.trim());
        if (!referrerUid) {
          setError("Invalid referral code.");
          setIsSubmitting(false);
          return;
        }
      }

      const preCheck = await getUserData(firebaseUser.uid);
      if (preCheck) {
        refreshUser(preCheck);
        return;
      }

      const profile = await createInitialProfile(firebaseUser, username, referrerUid);
      refreshUser(profile);
      localStorage.removeItem('referralCode');
    } catch (err: any) {
      if (err.message === "USERNAME_TAKEN") {
        setError("This handle is already claimed.");
        setIsNameTaken(true);
      } else if (err.message?.includes("permission")) {
        setError("Access denied. Please check your connection.");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCap) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  // --- CAP REACHED SCREEN ---
  if (isNetworkCapped) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-maroon/30">
        {/* Background Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,60,60,0.1),rgba(0,0,0,0))]" />

        <div className="relative z-10 max-w-md w-full text-center space-y-8 p-10 glass-panel rounded-3xl animate-scale-in">
          <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 shadow-xl">
            <Lock className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Access Prohibited</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The Genesis Epoch has reached its hard cap of <span className="text-zinc-300 font-mono font-medium">{limitCount.toLocaleString()}</span> nodes.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Registration Closed</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-maroon/30">

      {/* Premium Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-maroon/5 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none mix-blend-overlay"></div>

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in-up">

        {/* Header Section */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900/50 border border-zinc-800 mb-4 shadow-xl shadow-black/50">
            <CodeIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Initialize Node</h1>
          <p className="text-zinc-500 text-sm">Configure your operator identity to begin.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6 shadow-2xl">

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 ml-1">Operator Handle</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">
                <Terminal className="w-4 h-4" />
              </div>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                placeholder="username"
                className={`w-full bg-zinc-900/50 border text-white text-sm py-3.5 pl-11 pr-10 rounded-xl transition-all outline-none placeholder:text-zinc-700
                  ${isNameTaken === true
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                    : isNameTaken === false
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                      : 'border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-white/5'
                  }`}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {checkingName && <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" />}
                {!checkingName && isNameTaken === false && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 animate-scale-in" />}
              </div>
            </div>
            {/* Status Message */}
            <div className="h-4 pl-1">
              {!checkingName && isNameTaken === true && <span className="text-[10px] text-red-500 font-medium animate-fade-in">Handle unavailable</span>}
              {!checkingName && isNameTaken === false && <span className="text-[10px] text-emerald-500 font-medium animate-fade-in">Handle available</span>}
            </div>
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 ml-1">Referral Code <span className="text-zinc-600">(Optional)</span></label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                value={refCode}
                onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                placeholder="ARG-XXXX"
                className="w-full bg-zinc-900/50 border border-zinc-800 text-white text-sm py-3.5 pl-11 pr-4 rounded-xl transition-all outline-none placeholder:text-zinc-700 focus:border-zinc-600 focus:ring-1 focus:ring-white/5 uppercase font-mono tracking-wider"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-400 leading-relaxed font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            disabled={isSubmitting || !username || isNameTaken !== false || username.length < 3}
            className={`w-full h-12 bg-white text-black text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform
              ${isSubmitting || !username || isNameTaken !== false || username.length < 3
                ? 'opacity-50 cursor-not-allowed contrast-50'
                : 'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-[0.98]'
              }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Initialize</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        <p className="text-center mt-8 text-[11px] text-zinc-600 font-medium">
          By initializing, you agree to the <a href="#" className="underline decoration-zinc-800 hover:text-zinc-400 transition-colors">Protocol Standards</a>
        </p>
      </div>
    </div>
  );
};

// Simple Icon Component (since Fingerprint might look too biometric)
const CodeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export default ProfileSetup;
