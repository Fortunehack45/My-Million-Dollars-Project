import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeTask, subscribeToTasks } from '../services/firebase';
import { Task } from '../types';
import { Twitter, MessageCircle, Send, Globe, ShieldCheck, Loader2, Clock, AlertCircle } from 'lucide-react';

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
    <div className="surface p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between group gap-6 transition-all duration-300 relative overflow-hidden">
      {/* Progress Background Overlay */}
      {timer !== null && timer > 0 && (
         <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <p className="label-meta text-zinc-600 uppercase tracking-[0.2em]">Directive::{task.id.slice(0, 4)}</p>
           {isCompleted && <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Validated</span>}
           {timer !== null && timer > 0 && (
             <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase bg-amber-500/10 px-2 py-0.5 rounded animate-pulse">
               <Clock className="w-2 h-2" />
               Syncing {timer}s
             </span>
           )}
        </div>
        <div>
           <h3 className={`text-xl font-bold text-white ${isCompleted ? 'opacity-40' : ''}`}>{task.title}</h3>
           <p className="text-zinc-500 text-xs font-medium mt-1">{task.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-zinc-900 pt-6 md:pt-0">
        <div className="text-left md:text-right">
          <p className="label-meta opacity-40 mb-1">Incentive</p>
          <p className={`font-mono font-bold text-sm ${isCompleted ? 'text-zinc-700' : 'text-primary'}`}>
            +{task.points} ARG
          </p>
        </div>
        
        {isCompleted ? (
           <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
           </div>
        ) : timer === 0 ? (
          <button onClick={() => onComplete(task)} className="btn-primary !px-6 !py-3">Claim Reward</button>
        ) : timer !== null ? (
          <button disabled className="btn-secondary !opacity-40 flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            {timer}s left
          </button>
        ) : (
          <button onClick={handleStart} className="btn-secondary">Initialize</button>
        )}
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
    <div className="w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Protocol Tasks</h1>
        <p className="text-zinc-500 text-sm font-medium">Authenticate your identity by completing high-priority network directives.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
          <p className="label-meta text-zinc-600">Retrieving Protocol Directives...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.length === 0 && (
             <div className="surface p-12 text-center rounded-3xl border-dashed border-zinc-800">
               <p className="label-meta text-zinc-600">No active directives found.</p>
             </div>
          )}
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} user={user} onComplete={handleComplete} />
          ))}

          {tasks.length > 0 && (
            <div className="p-6 bg-zinc-900/20 border border-zinc-900 rounded-2xl flex items-start gap-4">
               <AlertCircle className="w-4 h-4 text-zinc-600 mt-0.5" />
               <p className="text-[10px] text-zinc-600 font-medium leading-relaxed uppercase">
                 Note: Tasks with sync timers require the browser tab to remain active during authentication. 
                 Premature closure may result in verification failure.
               </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialTasks;