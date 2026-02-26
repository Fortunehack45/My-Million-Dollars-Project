import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        try {
            const consent = localStorage.getItem('argus_cookie_consent');
            if (!consent) {
                // Small delay for dramatic entrance
                const timer = setTimeout(() => setIsVisible(true), 1500);
                return () => clearTimeout(timer);
            }
        } catch (e) {
            console.warn('LocalStorage access denied for cookie consent.');
        }
    }, []);

    const handleAcceptAll = () => {
        try {
            localStorage.setItem('argus_cookie_consent', 'all');
        } catch (e) {
            console.warn('Failed to save cookie consent.');
        }
        setIsVisible(false);
    };

    const handleEssentialOnly = () => {
        try {
            localStorage.setItem('argus_cookie_consent', 'essential');
        } catch (e) {
            console.warn('Failed to save cookie consent.');
        }
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[450px] z-[9999] animate-fade-in-up">
            <div className="silk-panel p-6 rounded-3xl border border-zinc-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-[50px] pointer-events-none rounded-full" />

                <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-900 shadow-lg">
                            <ShieldCheck className="w-5 h-5 text-maroon" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm tracking-tight">Privacy & Telemetry Protocol</h3>
                            <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">Argus_Consent_v1.0</p>
                        </div>
                    </div>
                    <button
                        onClick={handleEssentialOnly}
                        className="text-zinc-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-medium relative z-10 border-l-2 border-zinc-800 pl-4">
                    Argus Protocol utilizes institutional telemetry constraints to optimize node performance, cryptographic security, and dashboard analytics. Review our <a href="#/privacy" className="text-maroon hover:text-white transition-colors underline decoration-maroon/30">Privacy Matrix</a> for data vectors.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10">
                    <button
                        onClick={handleEssentialOnly}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-900 hover:text-white transition-all order-2 sm:order-1"
                    >
                        Essential Only
                    </button>
                    <button
                        onClick={handleAcceptAll}
                        className="w-full sm:flex-1 btn-premium order-1 sm:order-2 py-3"
                    >
                        Accept Protocol
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
