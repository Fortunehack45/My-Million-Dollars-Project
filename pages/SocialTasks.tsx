import React from 'react';
import { useAuth } from '../context/AuthContext';
import { completeTask } from '../services/firebase';
import { Task } from '../types';
import { Twitter, MessageCircle, Send, Globe, ShieldCheck } from 'lucide-react';

const TASKS: Task[] = [
  { id: 't1', title: 'Operator Sync (X)', description: 'Link your operator identity to a verified social handle.', points: 100, icon: 'twitter', link: 'https://twitter.com', actionLabel: 'Verify Handle' },
  { id: 't2', title: 'Coordination Hub (Discord)', description: 'Initialize developer coordination in the central hub.', points: 150, icon: 'discord', link: 'https://discord.com', actionLabel: 'Join Server' },
  { id: 't3', title: 'Relay Sub (Telegram)', description: 'Subscribe to the low-latency network status relay.', points: 100, icon: 'telegram', link: 'https://t.me', actionLabel: 'Enable Feed' },
];

const SocialTasks = () => {
  const { user, refreshUser } = useAuth();

  const handleTaskClick = async (task: Task) => {
    if (!user || user.completedTasks.includes(task.id)) return;
    window.open(task.link, '_blank');
    setTimeout(async () => {
      try {
        await completeTask(user.uid, task.id, task.points);
        refreshUser({
          ...user,
          points: user.points + task.points,
          completedTasks: [...user.completedTasks, task.id]
        });
      } catch (err) { console.error(err); }
    }, 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Verification</h1>
        <p className="text-zinc-500 text-sm font-medium">Complete protocol handshakes to authenticate your presence.</p>
      </header>

      <div className="space-y-4">
        {TASKS.map((task) => {
          const isCompleted = user.completedTasks.includes(task.id);
          return (
            <div key={task.id} className="surface p-8 rounded-2xl flex items-center justify-between group">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <p className="label-meta text-zinc-600 uppercase tracking-[0.2em]">Req::{task.id}</p>
                   {isCompleted && <span className="text-[9px] font-black text-primary uppercase">Validated</span>}
                </div>
                <div>
                   <h3 className={`text-xl font-bold text-white ${isCompleted ? 'opacity-40' : ''}`}>{task.title}</h3>
                   <p className="text-zinc-500 text-xs font-medium mt-1">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="label-meta opacity-40 mb-1">Incentive</p>
                  <p className={`font-mono font-bold text-sm ${isCompleted ? 'text-zinc-700' : 'text-primary'}`}>
                    +{task.points} NEX
                  </p>
                </div>
                
                {isCompleted ? (
                   <ShieldCheck className="w-5 h-5 text-zinc-800" />
                ) : (
                  <button onClick={() => handleTaskClick(task)} className="btn-secondary">Initialize</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SocialTasks;