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
import AdminPanel from './pages/AdminPanel';
import Landing from './pages/Landing';

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

  if (!firebaseUser) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/setup" />;
  
  return <Layout>{children}</Layout>;
};

const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, firebaseUser, loading } = useAuth();
  if (loading) return null;
  if (firebaseUser && user) return <Navigate to="/" />;
  if (firebaseUser && !user) return <Navigate to="/setup" />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { firebaseUser, user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/" element={
        loading ? null : (firebaseUser && user ? (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) : <Landing />)
      } />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/setup" element={
        firebaseUser && !user ? <ProfileSetup /> : <Navigate to="/" />
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

      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPanel />
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