import React from 'react';
import PublicLayout from '../components/PublicLayout';

const Whitepaper = () => {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-6 py-24">
         <div className="mb-16 border-b border-zinc-900 pb-8">
            <p className="label-meta text-primary mb-4">Technical Paper v1.0</p>
            <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">Argus Protocol<br/>Whitepaper</h1>
            <p className="text-xl text-zinc-400 font-serif italic">"A specialized compute layer for the sovereign internet."</p>
         </div>

         <div className="prose prose-invert prose-zinc max-w-none">
            <h3>1. Abstract</h3>
            <p>
               The current landscape of decentralized networks suffers from a trilemma of scalability, security, and decentralization. 
               Argus Protocol introduces a novel "Proof-of-Uptime" consensus mechanism combined with GhostDAG topology to solve this. 
               By decoupling execution from consensus and utilizing institutional-grade hardware requirements, Argus achieves 400,000 TPS 
               without compromising on trustlessness.
            </p>

            <h3>2. Introduction</h3>
            <p>
               As Real World Assets (RWAs) move on-chain, the need for deterministic, high-frequency infrastructure becomes critical. 
               Existing monolithic blockchains cannot handle the throughput required by global financial markets (NASDAQ, NYSE). 
               Argus positions itself as the "High-Speed Rail" connecting these markets to Web3.
            </p>

            <h3>3. Technical Architecture</h3>
            <h4>3.1 GhostDAG Consensus</h4>
            <p>
               Unlike traditional blockchains that discard orphan blocks, GhostDAG includes them in the ledger, ordering them topologically. 
               This allows for parallel block production and utilizes the full bandwidth of the network.
            </p>
            <h4>3.2 The ArgusVM</h4>
            <p>
               A custom implementation of WASM designed for parallel transaction execution. State access is sharded by account address, 
               allowing non-conflicting transactions to execute simultaneously on different CPU cores.
            </p>

            <h3>4. Tokenomics (ARG)</h3>
            <p>
               The ARG token is the fuel of the network. It serves three primary functions:
            </p>
            <ul>
               <li><strong>Gas:</strong> Payment for computation and storage.</li>
               <li><strong>Security:</strong> Staked by validators to secure the network.</li>
               <li><strong>Governance:</strong> Voting weight in the DAO.</li>
            </ul>
            <p>
               <strong>Total Supply:</strong> 1,000,000,000 ARG<br/>
               <strong>Distribution:</strong> 40% Mining/Staking, 20% Investors, 20% Team (4yr Vest), 20% Ecosystem Fund.
            </p>

            <h3>5. Conclusion</h3>
            <p>
               Argus is not just another L1; it is a specialized execution environment for high-value data. By prioritizing uptime and 
               performance, we create the necessary foundation for the next decade of crypto adoption.
            </p>
         </div>
      </div>
    </PublicLayout>
  );
};

export default Whitepaper;