import React from 'react';
import PublicLayout from '../components/PublicLayout';
import { Book, Code, Terminal } from 'lucide-react';

const Docs = () => {
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
         {/* Sidebar */}
         <div className="w-full md:w-64 shrink-0 space-y-8">
            <div>
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Getting Started</h3>
               <ul className="space-y-2">
                  <li className="text-primary font-medium text-sm border-l-2 border-primary pl-3">Introduction</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Quick Start</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">System Requirements</li>
               </ul>
            </div>
            <div>
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Node Operations</h3>
               <ul className="space-y-2">
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Running a Validator</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Staking Guide</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Security Best Practices</li>
               </ul>
            </div>
            <div>
               <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Developers</h3>
               <ul className="space-y-2">
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">JSON-RPC API</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Smart Contracts (Rust)</li>
                  <li className="text-zinc-400 hover:text-white text-sm pl-3.5 cursor-pointer">Argus SDK</li>
               </ul>
            </div>
         </div>

         {/* Content */}
         <div className="flex-1">
            <div className="prose prose-invert prose-zinc max-w-none">
               <h1>Argus Protocol Documentation</h1>
               <p className="lead">
                  Welcome to the official documentation for Argus Protocol. Here you will find everything you need to build on, 
                  validate, and interact with the Argus network.
               </p>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12 not-prose">
                  <div className="surface p-6 rounded-xl border border-zinc-900 hover:border-primary/30 transition-colors cursor-pointer group">
                     <Terminal className="w-8 h-8 text-zinc-500 mb-4 group-hover:text-primary transition-colors" />
                     <h3 className="text-lg font-bold text-white mb-2">Run a Node</h3>
                     <p className="text-sm text-zinc-500">Set up your validator environment in 5 minutes using Docker.</p>
                  </div>
                  <div className="surface p-6 rounded-xl border border-zinc-900 hover:border-primary/30 transition-colors cursor-pointer group">
                     <Code className="w-8 h-8 text-zinc-500 mb-4 group-hover:text-primary transition-colors" />
                     <h3 className="text-lg font-bold text-white mb-2">Build dApps</h3>
                     <p className="text-sm text-zinc-500">Learn how to deploy Rust or Solidity contracts to ArgusVM.</p>
                  </div>
               </div>

               <h2>Quick Start</h2>
               <p>Initialize a new node using the CLI:</p>
               <pre className="bg-zinc-950 border border-zinc-900 p-4 rounded-lg overflow-x-auto text-sm">
                  <code className="text-zinc-300">
                     $ curl -sL https://get.argus.network | bash{'\n'}
                     $ argus init --network testnet{'\n'}
                     $ argus start
                  </code>
               </pre>
            </div>
         </div>
      </div>
    </PublicLayout>
  );
};

export default Docs;