
import React from 'react';
/* Update import to react-router to resolve missing export errors for HashRouter, Routes, Route, and Navigate */
import { HashRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SocialTasks from './pages/SocialTasks';
import Leaderboard from './pages/Leaderboard';
import Referrals from './pages/Referrals';
import NFTSection from './pages/NFTSection';
import Login from './pages/Login';

// Protected Route Wrapper
/* Made children optional to satisfy TS when used in JSX contexts where inference might fail */
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; // Or a spinner
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
};

// Public Route Wrapper (redirects to dashboard if logged in)
/* Made children optional to satisfy TS when used in JSX contexts where inference might fail */
const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/" />;
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
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