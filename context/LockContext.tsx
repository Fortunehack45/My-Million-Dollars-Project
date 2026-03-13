import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToLockedPages, ADMIN_EMAIL } from '../services/firebase';
import { useAuth } from './AuthContext';

interface LockContextType {
  lockedPages: string[];
  isLocked: (path: string) => boolean;
  loading: boolean;
}

const LockContext = createContext<LockContextType | undefined>(undefined);

export const LockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { firebaseUser } = useAuth();
  const [lockedPages, setLockedPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToLockedPages((locks) => {
      setLockedPages(locks);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isLocked = (path: string) => {
    const isAuthorizedAdmin = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    return !isAuthorizedAdmin && lockedPages.includes(path);
  };

  return (
    <LockContext.Provider value={{ lockedPages, isLocked, loading }}>
      {children}
    </LockContext.Provider>
  );
};

export const useLocks = () => {
  const context = useContext(LockContext);
  if (context === undefined) {
    throw new Error('useLocks must be used within a LockProvider');
  }
  return context;
};
