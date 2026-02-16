import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Extend window interface for security flag
declare global {
  interface Window {
    __ARGUS_SECURE_BOOT?: boolean;
  }
}

// Security Handshake
// If index.html's security script didn't run (e.g. scraped HTML without JS), this check fails.
if (window.__ARGUS_SECURE_BOOT) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // Silent fail
  }
} else {
  // If loaded in an environment where the head script didn't execute
  document.body.innerHTML = "ERR_SECURE_BOOT_FAILED";
}