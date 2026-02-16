import React from 'react';
import PublicLayout from '../components/PublicLayout';

export const Terms = () => (
  <PublicLayout>
    <div className="max-w-3xl mx-auto px-6 py-24 space-y-8">
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Terms of Service</h1>
      <p className="text-zinc-500 text-sm">Last Updated: January 1, 2025</p>
      
      <div className="space-y-6 text-zinc-300 leading-relaxed text-sm">
        <p>
          By accessing or using the Argus Protocol network, website, or associated tools ("The Service"), you agree to be bound by these terms.
        </p>
        <h3 className="text-white font-bold uppercase">1. Use of Service</h3>
        <p>
          You agree to use the service only for lawful purposes. You must not use the service to distribute malware, engage in illegal financial activities, or attack the network infrastructure.
        </p>
        <h3 className="text-white font-bold uppercase">2. No Financial Advice</h3>
        <p>
          The ARG token and associated mining rewards are utility tokens for network participation. Nothing on this website constitutes financial advice. The value of cryptographic tokens is highly volatile.
        </p>
        <h3 className="text-white font-bold uppercase">3. Limitation of Liability</h3>
        <p>
          Argus Labs is not liable for any damages arising from the use or inability to use the service, including but not limited to loss of funds, data, or profits.
        </p>
      </div>
    </div>
  </PublicLayout>
);

export const Privacy = () => (
  <PublicLayout>
    <div className="max-w-3xl mx-auto px-6 py-24 space-y-8">
      <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Privacy Policy</h1>
      <p className="text-zinc-500 text-sm">Last Updated: January 1, 2025</p>
      
      <div className="space-y-6 text-zinc-300 leading-relaxed text-sm">
        <h3 className="text-white font-bold uppercase">1. Data Collection</h3>
        <p>
          We prioritize user anonymity. We do not collect personal identifying information (PII) unless explicitly provided (e.g., email for newsletter). Network interaction data (wallet addresses, transactions) is public on the blockchain.
        </p>
        <h3 className="text-white font-bold uppercase">2. Cookies & Analytics</h3>
        <p>
          We use local storage for session management. We may use anonymous analytics to improve service performance.
        </p>
        <h3 className="text-white font-bold uppercase">3. Third Party Services</h3>
        <p>
          Our authentication (Google Auth) is handled by Firebase. Please refer to Google's privacy policy for details on how they handle your login data.
        </p>
      </div>
    </div>
  </PublicLayout>
);