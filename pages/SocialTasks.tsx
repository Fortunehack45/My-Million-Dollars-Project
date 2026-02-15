import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { completeTask, fetchTasks } from '../services/firebase';
import { Task } from '../types';
import { Twitter, MessageCircle, Send, Globe, ShieldCheck, Loader2 } from 'lucide-react';

const SocialTasks = () => {
  const { user, refreshUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await fetchTasks();
        setTasks(data);
      } catch (err) {
        console.error("Error loading directives:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const handleTaskClick = async (task: Task) => {
    if (!user || user.completedTasks.includes(task.id)) return;
    
    // Open link in new tab
    window.open(task.link, '_blank');
    
    // Simulate manual protocol verification delay
    setTimeout(async () => {
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
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Verification</h1>
        <p className="text-zinc-500 text-sm font-medium">Complete protocol handshakes to authenticate your presence.</p>
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
          {tasks.map((task) => {
            const isCompleted = user.completedTasks.includes(task.id);
            return (
              <div key={task.id} className="surface p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between group gap-6 transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <p className="label-meta text-zinc-600 uppercase tracking-[0.2em]">Directive::{task.id.slice(0, 4)}</p>
                     {isCompleted && <span className="text-[9px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Validated</span>}
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
                      +{task.points} NEX
                    </p>
                  </div>
                  
                  {isCompleted ? (
                     <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                       <ShieldCheck className="w-5 h-5 text-emerald-500" />
                     </div>
                  ) : (
                    <button onClick={() => handleTaskClick(task)} className="btn-secondary">Initialize</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SocialTasks;