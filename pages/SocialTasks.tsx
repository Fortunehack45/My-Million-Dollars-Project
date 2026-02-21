
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeTask, subscribeToTasks } from '../services/firebase';
import { Task } from '../types';
import { Twitter, MessageCircle, Send, Globe, ShieldCheck, Loader2, Clock, AlertCircle, ArrowRight, ExternalLink, Timer } from 'lucide-react';

const TaskItem: React.FC<{ task: Task, user: any, onComplete: (task: Task) => void | Promise<void> }> = ({ task, user, onComplete }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const isCompleted = user.completedTasks.includes(task.id);
  const timerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Use the admin defined verification wait time, default to 3s if not set
  const waitTime = task.verificationWaitTime || 3;

  useEffect(() => {
    // Expiration Countdown logic
    const updateCountdown = () => {
      if (!task.expiresAt) {
        setTimeLeft(null);
        return;
      }

      const now = Date.now();
      const diff = Math.max(0, task.expiresAt - now);

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = h > 0 ? `${h}H ` : '';
      const mStr = m.toString().padStart(2, '0');
      const sStr = s.toString().padStart(2, '0');

      setTimeLeft(`${hStr}${mStr}:${sStr}`);
    };

    updateCountdown();
    countdownIntervalRef.current = window.setInterval(updateCountdown, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [task.expiresAt]);

  const handleStart = () => {
    window.open(task.link, '_blank');
    setIsVerifying(true);

    // Hidden verification timer
    timerRef.current = window.setTimeout(() => {
      setIsVerifying(false);
      setCanClaim(true);
    }, waitTime * 1000);
  };

  return (
    <div className={`group relative overflow-hidden rounded-[2.5rem] silk-panel transition-silk ${isCompleted ? 'opacity-40 grayscale pointer-events-none' : 'hover:-translate-y-1'}`}>

      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:items-center relative z-10">
        {/* Status Icon */}
        <div className={`hidden md:flex w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 transition-silk ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-950 border-white/5 text-zinc-500 group-hover:text-maroon group-hover:border-maroon/20 group-hover:bg-maroon/5'}`}>
          {isCompleted ? <ShieldCheck className="w-7 h-7" /> : (task.icon === 'twitter' ? <Twitter className="w-7 h-7" /> : task.icon === 'telegram' ? <Send className="w-7 h-7" /> : <Globe className="w-7 h-7" />)}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="label-meta text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
              DIR-{task.id.slice(0, 4)}
            </span>

            {timeLeft && !isCompleted && timeLeft !== 'EXPIRED' && (
              <span className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${timeLeft.includes('h') ? 'text-zinc-400 border-zinc-800 bg-zinc-900/50' : 'text-maroon border-maroon/20 bg-maroon/5 animate-pulse'}`}>
                <Timer className="w-3 h-3" /> Ends in: {timeLeft}
              </span>
            )}

            {isVerifying && (
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
                <Clock className="w-3 h-3" /> Verifying Protocol...
              </span>
            )}
          </div>
          <h3 className={`text-lg font-bold text-white ${isCompleted ? 'line-through decoration-zinc-700' : ''}`}>{task.title}</h3>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-xl">{task.description}</p>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-end md:gap-4 border-t md:border-t-0 border-zinc-800/50 pt-4 md:pt-0 mt-2 md:mt-0">
          <div className="md:text-right">
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-0.5">Reward</p>
            <p className={`font-mono font-bold text-sm ${isCompleted ? 'text-zinc-500' : 'text-maroon'}`}>+{task.points.toFixed(2)} ARG</p>
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Validated</span>
            </div>
          ) : timeLeft === 'EXPIRED' ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800 opacity-50">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Closed</span>
            </div>
          ) : canClaim ? (
            <button onClick={() => onComplete(task)} className="btn-premium-maroon !px-8 !py-3 animate-pulse">
              Claim Reward <ArrowRight className="w-4 h-4" />
            </button>
          ) : isVerifying ? (
            <button disabled className="bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-lg px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-wait">
              <Loader2 className="w-3 h-3 animate-spin" /> Verifying...
            </button>
          ) : (
            <button onClick={handleStart} className="bg-white text-black hover:bg-zinc-200 border border-transparent rounded-lg px-5 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
              Start Task <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialTasks = () => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // subscribeToTasks now handles filtering expired tasks
    const unsubscribe = subscribeToTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleComplete = async (task: Task) => {
    if (!user || user.completedTasks.includes(task.id)) return;
    try {
      await completeTask(user.uid, task.id, task.points);
      refreshUser({
        ...user,
        points: user.points + task.points,
        completedTasks: [...user.completedTasks, task.id]
      });
    } catch (err) {
      console.error("Handshake validation failed:", err);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-12 animate-in fade-in duration-500 will-change-premium">
      {/* Institutional Header - Resized to Dashboard Standards */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-900 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 flex items-center justify-center rounded-xl">
            <ShieldCheck className="w-5 h-5 text-maroon animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black text-white uppercase tracking-tight">Operational_Tasks</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Security_Clearance: Alpha_One · v2.8</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="label-meta mb-0.5">Directive_Status</p>
            <p className="text-sm font-mono font-black text-white">{tasks.filter(t => user.completedTasks.includes(t.id)).length}/{tasks.length} <span className="text-zinc-600 text-[10px]">SYNCED</span></p>
          </div>
          <div className="h-6 w-px bg-zinc-800" />
          <div className="w-9 h-9 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center">
            <Timer className="w-5 h-5 text-maroon/60" />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-zinc-950 p-6 md:p-8 rounded-[2.5rem] border border-zinc-900 flex items-center gap-6">
              <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-3 w-full max-w-sm" />
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="skeleton h-3 w-12" />
                <div className="skeleton h-10 w-32 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 && (
            <div className="silk-panel p-20 text-center rounded-[2.5rem] border-dashed opacity-40">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-zinc-700" />
              </div>
              <p className="label-meta text-zinc-600">No active directives found.</p>
            </div>
          )}

          <div className="grid gap-4">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} user={user} onComplete={handleComplete} />
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500/60 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-500/60 font-medium leading-relaxed uppercase tracking-wide">
                Note: Verification protocols run asynchronously. Do not close browser tabs during active timers to prevent validation errors.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialTasks;
