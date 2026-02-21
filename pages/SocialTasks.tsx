
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
    <div className="w-full space-y-16 animate-in fade-in duration-700 pb-32 relative">

      {/* Background Dramatic Atmospherics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-maroon/[0.03] blur-[200px] -z-10 pointer-events-none" />

      {/* HEADER - Institutional Operations Interface */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-zinc-900/50 relative overflow-hidden">
        <div className="absolute -left-20 top-0 w-64 h-64 bg-maroon/[0.05] blur-[100px] rounded-full pointer-events-none" />
        <div className="flex items-start gap-8 relative z-10">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-900 flex items-center justify-center rounded-[1.5rem] shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-maroon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <ShieldCheck className="w-8 h-8 text-maroon animate-pulse" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Operational Directives</h1>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest leading-none font-bold">Clearance: ALPHA_PROTOCOL</p>
              </div>
              <div className="h-1 w-1 rounded-full bg-zinc-800" />
              <p className="text-[11px] font-mono text-maroon font-black uppercase tracking-widest leading-none italic">
                Argus_Taskmaster_v4.2
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10 relative z-10 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl">
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Directive_Progress</p>
            <div className="flex items-center justify-end gap-3">
              <p className="text-2xl font-mono font-black text-white tracking-widest">{tasks.filter(t => user.completedTasks.includes(t.id)).length}</p>
              <span className="text-[10px] text-zinc-700 font-black uppercase tracking-widest font-mono">/ {tasks.length}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-zinc-900" />
          <div className="text-right space-y-1">
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] font-mono">Deployment_Vector</p>
            <p className="text-2xl font-mono font-black text-maroon tracking-widest">ACTIVE</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-zinc-950 p-12 rounded-[3.5rem] silk-panel flex items-center gap-10">
              <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="skeleton h-3 w-24" />
                <div className="skeleton h-8 w-64" />
                <div className="skeleton h-4 w-full max-w-lg" />
              </div>
              <div className="flex flex-col items-end gap-4">
                <div className="skeleton h-4 w-16" />
                <div className="skeleton h-14 w-48 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {tasks.length === 0 && (
            <div className="silk-panel p-32 text-center rounded-[3.5rem] border-dashed border-zinc-800/50 bg-zinc-950/50 group hover:border-maroon/20 transition-all duration-700">
              <div className="w-24 h-24 bg-zinc-900/50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-800 group-hover:border-maroon/40 transition-all">
                <ShieldCheck className="w-10 h-10 text-zinc-700 group-hover:text-maroon transition-all" />
              </div>
              <div className="space-y-4">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.8em] font-mono italic">Zero_Directives_Found</p>
                <p className="text-zinc-700 text-lg font-medium italic max-w-xl mx-auto">Topology continuum currently stable. Monitor relay for future operational mandates.</p>
              </div>
            </div>
          )}

          <div className="grid gap-8">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} user={user} onComplete={handleComplete} />
            ))}
          </div>

          {tasks.length > 0 && (
            <div className="mt-16 bg-zinc-900/30 p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-10 group/alert hover:border-maroon/20 transition-all">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group-hover/alert:border-maroon/40 transition-all shadow-2xl relative">
                <AlertCircle className="w-6 h-6 text-maroon animate-pulse" />
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left">
                <p className="text-[10px] font-black text-maroon uppercase tracking-[0.4em] font-mono">Verification Protocol Alert</p>
                <p className="text-zinc-500 text-sm md:text-lg leading-relaxed italic font-medium">
                  Verification processes run on <span className="text-white font-bold">Asynchronous Sub-Routines</span>.
                  Do not disrupt the synchronization cycles to ensure proper grant allocation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center opacity-40 px-12">
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700">Argus_Mission_Control // SECURE_SYNC</p>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-zinc-700 italic">Auth_Task_Cycle_4923</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-maroon/10 to-transparent"></div>
    </div>
  );
};

export default SocialTasks;
