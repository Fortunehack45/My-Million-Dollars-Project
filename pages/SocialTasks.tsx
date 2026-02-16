import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeTask, subscribeToTasks } from '../services/firebase';
import { Task } from '../types';
import { Twitter, MessageCircle, Send, Globe, ShieldCheck, Loader2, Clock, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';

const TaskItem: React.FC<{ task: Task, user: any, onComplete: (task: Task) => void | Promise<void> }> = ({ task, user, onComplete }) => {
  const [timer, setTimer] = useState<number | null>(null);
  const isCompleted = user.completedTasks.includes(task.id);
  const intervalRef = useRef<number | null>(null);

  const handleStart = () => {
    window.open(task.link, '_blank');
    if (task.timerSeconds && task.timerSeconds > 0) {
      setTimer(task.timerSeconds);
    } else {
      setTimeout(() => onComplete(task), 2000);
    }
  };

  useEffect(() => {
    if (timer !== null && timer > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimer(prev => {
          if (prev !== null && prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timer]);

  const progress = timer !== null && task.timerSeconds ? ((task.timerSeconds - timer) / task.timerSeconds) * 100 : 0;

  return (
    <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${isCompleted ? 'bg-zinc-950/50 border-zinc-900 opacity-60' : 'bg-zinc-900/20 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'}`}>
      
      {/* Progress Background Overlay */}
      {timer !== null && timer > 0 && (
         <div className="absolute bottom-0 left-0 h-1 bg-primary/50 transition-all duration-1000 z-20" style={{ width: `${progress}%` }}></div>
      )}

      <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:items-center relative z-10">
        {/* Status Icon */}
        <div className={`hidden md:flex w-12 h-12 rounded-xl border flex-items-center justify-center items-center shrink-0 ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:text-white transition-colors'}`}>
           {isCompleted ? <ShieldCheck className="w-5 h-5" /> : (task.icon === 'twitter' ? <Twitter className="w-5 h-5" /> : task.icon === 'telegram' ? <Send className="w-5 h-5" /> : <Globe className="w-5 h-5" />)}
        </div>

        <div className="flex-1 space-y-2">
           <div className="flex items-center gap-3 mb-1">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                DIR-{task.id.slice(0, 4)}
              </span>
              {timer !== null && timer > 0 && (
                <span className="flex items-center gap-1.5 text-[9px] font-bold text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
                  <Clock className="w-3 h-3" /> Syncing...
                </span>
              )}
           </div>
           <h3 className={`text-lg font-bold text-white ${isCompleted ? 'line-through decoration-zinc-700' : ''}`}>{task.title}</h3>
           <p className="text-zinc-500 text-xs leading-relaxed max-w-xl">{task.description}</p>
        </div>

        <div className="flex items-center justify-between md:flex-col md:items-end md:gap-4 border-t md:border-t-0 border-zinc-800/50 pt-4 md:pt-0 mt-2 md:mt-0">
           <div className="md:text-right">
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-0.5">Reward</p>
              <p className={`font-mono font-bold text-sm ${isCompleted ? 'text-zinc-500' : 'text-primary'}`}>+{task.points.toFixed(2)} ARG</p>
           </div>
           
           {isCompleted ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Validated</span>
              </div>
           ) : timer === 0 ? (
             <button onClick={() => onComplete(task)} className="btn-primary flex items-center gap-2 !px-5 !py-2.5 animate-pulse">
               Claim Reward <ArrowRight className="w-3 h-3" />
             </button>
           ) : timer !== null ? (
             <button disabled className="bg-zinc-900 text-zinc-500 border border-zinc-800 rounded-lg px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 cursor-wait">
               <Loader2 className="w-3 h-3 animate-spin" /> Verifying ({timer}s)
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
    <div className="w-full space-y-10 animate-in fade-in duration-500">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Protocol Tasks</h1>
        <p className="text-zinc-500 text-sm font-medium border-l-2 border-primary pl-4">Authenticate your identity by completing high-priority network directives to increase your allocation.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
          <p className="label-meta text-zinc-600">Retrieving Protocol Directives...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 && (
             <div className="surface p-12 text-center rounded-3xl border-dashed border-zinc-800 opacity-50">
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