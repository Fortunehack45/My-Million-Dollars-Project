import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Users, Globe, Target } from 'lucide-react';

const About = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
           <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-8">Building the<br/>Foundation</h1>
           <p className="text-xl text-zinc-400">
              Argus Labs is a decentralized collective of engineers, cryptographers, and system architects. 
              We are obsessed with uptime.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">Our Mission</h3>
              <p className="text-sm text-zinc-500">To eliminate the technical barrier to entry for blockchain participation through "Zero-Touch" infrastructure.</p>
           </div>
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">Our Vision</h3>
              <p className="text-sm text-zinc-500">A future where "The Nexus" acts as the primary layer of trust for the internet, running on indestructible nodes.</p>
           </div>
           <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center">
                 <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase">The Collective</h3>
              <p className="text-sm text-zinc-500">Distributed across 12 timezones. No headquarters. Governed by code and consensus.</p>
           </div>
        </div>

        <div className="surface p-12 rounded-3xl border border-zinc-900">
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 text-center">Strategic Partners</h2>
           <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale">
              {['SEQUOIA_COMPUTE', 'ANDREESSEN_CLOUD', 'BINANCE_LABS', 'COINBASE_VENTURES', 'POLYCHAIN_CAPITAL'].map((p) => (
                 <span key={p} className="text-lg font-black text-white">{p.replace('_', ' ')}</span>
              ))}
           </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;