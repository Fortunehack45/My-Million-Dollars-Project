import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SocialTasks from './pages/SocialTasks';
import Leaderboard from './pages/Leaderboard';
import Referrals from './pages/Referrals';
import NFTSection from './pages/NFTSection';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, firebaseUser, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="label-meta animate-pulse">Synchronizing_State</p>
      </div>
    </div>
  );

  // 1. If not even signed in with Google, go to Login
  if (!firebaseUser) return <Navigate to="/login" />;
  
  // 2. If signed in with Google but no Firestore profile, go to Setup
  if (!user) return <Navigate to="/setup" />;
  
  return <Layout>{children}</Layout>;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, firebaseUser, loading } = useAuth();
  
  if (loading) return null;
  
  // If fully logged in and profile exists
  if (firebaseUser && user) return <Navigate to="/" />;
  // If authenticated but setup is missing, go to setup
  if (firebaseUser && !user) return <Navigate to="/setup" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { firebaseUser, user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/setup" element={
        firebaseUser && !user ? <ProfileSetup /> : <Navigate to="/" />
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/tasks" element={
        <ProtectedRoute>
          <SocialTasks />
        </ProtectedRoute>
      } />
      
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <Leaderboard />
        </ProtectedRoute>
      } />
      
      <Route path="/referrals" element={
        <ProtectedRoute>
          <Referrals />
        </ProtectedRoute>
      } />

      <Route path="/nft" element={
        <ProtectedRoute>
          <NFTSection />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;