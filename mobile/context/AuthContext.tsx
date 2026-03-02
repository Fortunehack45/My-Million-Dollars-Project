
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth, db } from '../services/firebase';
import {
    onAuthStateChanged,
    signOut as fbSignOut,
    GoogleAuthProvider,
    signInWithCredential,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { rtdb } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: (u: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubProfile: (() => void) | undefined;

        const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                // Setup presence in RTDB
                try {
                    const statusRef = ref(rtdb, `status/${fbUser.uid}`);
                    const offline = { state: 'offline', last_changed: serverTimestamp(), uid: fbUser.uid };
                    const online = { state: 'online', last_changed: serverTimestamp(), uid: fbUser.uid };
                    onValue(ref(rtdb, '.info/connected'), (snap) => {
                        if (snap.val() === false) return;
                        onDisconnect(statusRef).set(offline).then(() => set(statusRef, online));
                    });
                } catch { /* RTDB optional */ }

                unsubProfile = onSnapshot(doc(db, 'users', fbUser.uid), (snap) => {
                    if (snap.exists()) {
                        setUser(snap.data() as User);
                    } else {
                        setUser(null);
                    }
                    setLoading(false);
                });
            } else {
                if (unsubProfile) { unsubProfile(); unsubProfile = undefined; }
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubAuth();
            if (unsubProfile) unsubProfile();
        };
    }, []);

    const logout = async () => {
        try { await fbSignOut(auth); } catch (e) { console.error('Logout failed:', e); }
    };

    const refreshUser = (u: User) => setUser(u);

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
