import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { auth, signInWithGoogle, logout as serviceLogout } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial Check (Simulate mostly for Mock Mode persistence or Firebase listener)
  useEffect(() => {
    const checkAuth = async () => {
      // For Mock Mode, check local storage
      const mockData = localStorage.getItem('nexus_mock_user');
      if (mockData) {
        setUser(JSON.parse(mockData));
        setLoading(false);
        return;
      }

      // For Real Firebase
      if (auth) {
        onAuthStateChanged(auth, async (firebaseUser) => {
            // In a real app, you would fetch the full User object from Firestore here
            // For simplicity in this hybrid logic, we'll let the Login component handle the initial set
            if (!firebaseUser) {
                setUser(null);
            }
            setLoading(false);
        });
      } else {
          setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async () => {
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
    } catch (e) {
      console.error(e);
      alert("Login failed. See console.");
    }
  };

  const logout = async () => {
    await serviceLogout();
    setUser(null);
  };

  const refreshUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};