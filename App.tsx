
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
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

  // Capture referral code from URL and persist it
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref);
    }
  }, [searchParams]);

  return (
    <Routes>
      <Route path="/" element={
        loading ? null : (
          firebaseUser ? (
            user ? (
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            ) : <Navigate to="/setup" />
          ) : <Landing />
        )
      } />

      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/setup" element={
        firebaseUser && !user ? <ProfileSetup /> : <Navigate to="/" />
      } />

      {/* App Routes */}
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

      <Route path="/vault" element={
        <RegistryProtectedRoute path="/vault">
          <Vault />
        </RegistryProtectedRoute>
      } />

      <Route path="/admin" element={
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      } />

      {/* Public Routes */}
      <Route path="/docs" element={<Docs />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/whitepaper" element={<Whitepaper />} />
      <Route path="/tokenomics" element={<Tokenomics />} />
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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
