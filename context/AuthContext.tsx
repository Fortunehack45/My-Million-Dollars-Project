import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth, signInWithGoogle, logout as serviceLogout, getUserData } from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  user: User | null; // Firestore Profile
  firebaseUser: FirebaseUser | null; // Firebase Auth User
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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await getUserData(fbUser.uid);
          setUser(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const fbUser = await signInWithGoogle();
      setFirebaseUser(fbUser);
      const profile = await getUserData(fbUser.uid);
      setUser(profile);
    } catch (e) {
      console.error(e);
    }
  };

  const logout = async () => {
    try {
      await serviceLogout();
      setFirebaseUser(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

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