
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth, signInWithGoogle, logout as serviceLogout, subscribeToUserProfile, setupPresence } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      
      if (fbUser) {
        setupPresence(fbUser.uid); // establish heartbeat
        
        // Subscribe to real-time profile changes
        unsubscribeProfile = subscribeToUserProfile(fbUser.uid, (userData) => {
          if (userData) {
            setUser(userData);
          } else {
            // User authenticated in Firebase Auth, but document deleted from Firestore
            setUser(null);
          }
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = undefined;
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
      // The onAuthStateChanged listener will handle the rest
    } catch (e) { console.error(e); }
  };

  const logout = async () => {
    try {
      await serviceLogout();
      // User state cleared by listener
    } catch (error) { console.error(error); }
  };

  const refreshUser = (updatedUser: User) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
