import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useSearchParams, useLocation } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import Dashboard from './pages/Dashboard';
import SocialTasks from './pages/SocialTasks';
import Leaderboard from './pages/Leaderboard';
import Referrals from './pages/Referrals';
import NFTSection from './pages/NFTSection';
import Login from './pages/Login';
import ProfileSetup from './pages/ProfileSetup';
import Vault from './pages/Vault';
import AdminPanel from './pages/AdminPanel';
import Landing from './pages/Landing';
import Architecture from './pages/Architecture';
import Whitepaper from './pages/Whitepaper';
import Tokenomics from './pages/Tokenomics';
import About from './pages/About';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import Docs from './pages/Docs';
import { Terms, Privacy } from './pages/Legal';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import { subscribeToLockedPages, ADMIN_EMAIL } from './services/firebase';

// Registry Protected Route (Enforces Admin Locks)
const RegistryProtectedRoute = ({ children, path }: { children: React.ReactNode, path: string }) => {
  const { user, firebaseUser, loading } = useAuth();
  const [lockedPages, setLockedPages] = React.useState<string[]>([]);
  const [checkingLocks, setCheckingLocks] = React.useState(true);

  React.useEffect(() => {
    const unsub = subscribeToLockedPages((locks) => {
      setLockedPages(locks);
      setCheckingLocks(false);
    });
    return () => unsub();
  }, []);

  if (loading || checkingLocks) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <p className="label-meta animate-pulse">Verifying_Registry_Handshake</p>
      </div>
    </div>
  );

  const isAuthorizedAdmin = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isLocked = !isAuthorizedAdmin && lockedPages.includes(path);

  if (isLocked) return <Navigate to="/" />;
  if (!firebaseUser) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/setup" />;

  return <Layout>{children}</Layout>;
};

// Standard Protected Route
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
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

const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <p className="label-meta animate-pulse">Synchronizing_State</p>
      </div>
    </div>
  );

  if (!firebaseUser) return <Navigate to="/login" />;
  if (!user) return <Navigate to="/setup" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { firebaseUser, user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Capture referral code from URL and persist it
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref);
    }
  }, [searchParams]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
      <Route path="/" element={
        loading ? null : (
          firebaseUser ? (
            user ? (
              <ProtectedRoute>
        <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            ) : <Navigate to="/setup" />
          ) : <PageTransition><Landing /></PageTransition>
        )
      } />

      <Route path="/login" element={
        <PublicRoute>
          <PageTransition><Login /></PageTransition>
        </PublicRoute>
      } />

      <Route path="/setup" element={
        firebaseUser && !user ? <PageTransition><ProfileSetup /></PageTransition> : <Navigate to="/" />
      } />

      {/* App Routes */}
      <Route path="/tasks" element={
        <ProtectedRoute>
          <PageTransition><SocialTasks /></PageTransition>
        </ProtectedRoute>
      } />

      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <PageTransition><Leaderboard /></PageTransition>
        </ProtectedRoute>
      } />

      <Route path="/referrals" element={
        <ProtectedRoute>
          <PageTransition><Referrals /></PageTransition>
        </ProtectedRoute>
      } />

      <Route path="/nft" element={
        <ProtectedRoute>
          <PageTransition><NFTSection /></PageTransition>
        </ProtectedRoute>
      } />

      <Route path="/vault" element={
        <RegistryProtectedRoute path="/vault">
          <PageTransition><Vault /></PageTransition>
        </RegistryProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <PageTransition><AdminPanel /></PageTransition>
        </AdminRoute>
      } />

      {/* Public Routes */}
      <Route path="/docs" element={<PageTransition><Docs /></PageTransition>} />
      <Route path="/architecture" element={<PageTransition><Architecture /></PageTransition>} />
      <Route path="/whitepaper" element={<PageTransition><Whitepaper /></PageTransition>} />
      <Route path="/tokenomics" element={<PageTransition><Tokenomics /></PageTransition>} />
      <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
      <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
      <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
      <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <CookieConsent />
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
