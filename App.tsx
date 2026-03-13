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

// Lockable Route (Enforces Admin Locks and optionally requires login)
const LockableRoute = ({ children, path, requireLogin = true }: { children?: React.ReactNode, path: string, requireLogin?: boolean }) => {
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
        <p className="label-meta animate-pulse">{requireLogin ? 'Synchronizing_State' : 'Verifying_Access'}</p>
      </div>
    </div>
  );

  const isAuthorizedAdmin = firebaseUser?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  const isLocked = !isAuthorizedAdmin && lockedPages.includes(path);

  if (isLocked) {
    if (path === '/') return <Navigate to="/login" replace />;
    return <Navigate to="/" replace />;
  }

  if (requireLogin) {
    if (!firebaseUser) return <Navigate to="/login" replace />;
    if (!user) return <Navigate to="/setup" replace />;
    return <Layout>{children}</Layout>;
  }

  return <>{children}</>;
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
              <LockableRoute path="/" requireLogin={true}>
                <PageTransition><Dashboard /></PageTransition>
              </LockableRoute>
            ) : <Navigate to="/setup" />
          ) : (
            <LockableRoute path="/" requireLogin={false}>
              <PageTransition><Landing /></PageTransition>
            </LockableRoute>
          )
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
        <LockableRoute path="/tasks" requireLogin={true}>
          <PageTransition><SocialTasks /></PageTransition>
        </LockableRoute>
      } />

      <Route path="/leaderboard" element={
        <LockableRoute path="/leaderboard" requireLogin={true}>
          <PageTransition><Leaderboard /></PageTransition>
        </LockableRoute>
      } />

      <Route path="/referrals" element={
        <LockableRoute path="/referrals" requireLogin={true}>
          <PageTransition><Referrals /></PageTransition>
        </LockableRoute>
      } />

      <Route path="/nft" element={
        <LockableRoute path="/nft" requireLogin={true}>
          <PageTransition><NFTSection /></PageTransition>
        </LockableRoute>
      } />

      <Route path="/vault" element={
        <LockableRoute path="/vault" requireLogin={true}>
          <PageTransition><Vault /></PageTransition>
        </LockableRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <PageTransition><AdminPanel /></PageTransition>
        </AdminRoute>
      } />

      {/* Public Routes */}
      <Route path="/docs" element={<LockableRoute path="/docs" requireLogin={false}><PageTransition><Docs /></PageTransition></LockableRoute>} />
      <Route path="/architecture" element={<LockableRoute path="/architecture" requireLogin={false}><PageTransition><Architecture /></PageTransition></LockableRoute>} />
      <Route path="/whitepaper" element={<LockableRoute path="/whitepaper" requireLogin={false}><PageTransition><Whitepaper /></PageTransition></LockableRoute>} />
      <Route path="/tokenomics" element={<LockableRoute path="/tokenomics" requireLogin={false}><PageTransition><Tokenomics /></PageTransition></LockableRoute>} />
      <Route path="/about" element={<LockableRoute path="/about" requireLogin={false}><PageTransition><About /></PageTransition></LockableRoute>} />
      <Route path="/careers" element={<LockableRoute path="/careers" requireLogin={false}><PageTransition><Careers /></PageTransition></LockableRoute>} />
      <Route path="/contact" element={<LockableRoute path="/contact" requireLogin={false}><PageTransition><Contact /></PageTransition></LockableRoute>} />
      <Route path="/terms" element={<LockableRoute path="/terms" requireLogin={false}><PageTransition><Terms /></PageTransition></LockableRoute>} />
      <Route path="/privacy" element={<LockableRoute path="/privacy" requireLogin={false}><PageTransition><Privacy /></PageTransition></LockableRoute>} />

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
