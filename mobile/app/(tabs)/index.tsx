
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, RefreshControl, Platform, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { argusSynapse } from '../../services/ArgusSynapseService';
import {
  calculateCurrentBlockHeight, BASE_MINING_RATE, REFERRAL_BOOST,
  MAX_REFERRALS, TOTAL_SUPPLY,
} from '../../constants';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { ActivityIndicator } from 'react-native';
import { Activity, Zap, Server, Layers, Cpu, Shield, TrendingUp, Clock, AlertTriangle } from 'lucide-react-native';
import haptics from '../../services/HapticService';
import Svg, { Line, G, Circle as SvgCircle } from 'react-native-svg';
import StatCard from '../../components/StatCard';
import ProgressRing from '../../components/ProgressRing';
import Toast from '../../components/Toast';
import Skeleton from '../../components/Skeleton';
import { useNotifications } from '../../context/NotificationContext';
import { Bell } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ── GhostDAG SVG Visualizer (mobile-native) ──────────────────────────
function GhostDAGViz() {
  const [nodes, setNodes] = useState<{ id: number; type: 'white' | 'red'; x: number; y: number }[]>([]);
  const w = width - 32;
  const h = 200;

  useEffect(() => {
    // Initial nodes
    const initial = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      type: Math.random() > 0.85 ? 'red' : 'white',
      x: Math.random() * w,
      y: Math.random() * h,
    } as const));
    setNodes(initial);

    const interval = setInterval(() => {
      setNodes(prev => {
        const next = [...prev];
        if (next.length > 25) next.shift();
        next.push({
          id: Date.now(),
          type: Math.random() > 0.9 ? 'red' : 'white',
          x: Math.random() * w,
          y: Math.random() * h,
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.ghostdagContainer}>
      <BlurView intensity={5} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.ghostdagHeader}>
        <View style={styles.ghostdagTitleRow}>
          <View style={styles.pulseDot} />
          <Text style={styles.ghostdagTitle}>GhostDAG_Topology · Synchronized</Text>
        </View>
        <Text style={styles.ghostdagLatency}>Latency: 8.4ms</Text>
      </View>

      <View style={{ height: h, width: w, overflow: 'hidden' }}>
        <Svg height={h} width={w}>
          {nodes.map((n, i) => {
            if (i === 0) return null;
            const prev = nodes[i - 1];
            return (
              <AnimatedLine
                key={`e-${n.id}`}
                x1={prev.x} y1={prev.y}
                x2={n.x} y2={n.y}
                stroke={n.type === 'red' ? 'rgba(128,0,0,0.2)' : 'rgba(255,255,255,0.05)'}
                strokeWidth={1}
                entering={FadeIn.delay(200)}
              />
            );
          })}
          {nodes.map((n) => (
            <AnimatedCircle
              key={n.id}
              cx={n.x} cy={n.y}
              r={n.type === 'red' ? 3 : 4}
              fill={n.type === 'red' ? Colors.maroon : Colors.white}
              opacity={0.6}
              entering={FadeIn.duration(800)}
              exiting={FadeOut}
            />
          ))}
        </Svg>
      </View>

      <View style={styles.ghostdagLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.white }]} />
          <Text style={styles.legendLabel}>Mainnet Block</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.maroon }]} />
          <Text style={styles.legendLabel}>Orphan/Red</Text>
        </View>
      </View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);
const AnimatedLine = Animated.createAnimatedComponent(Line);
import { FadeIn, FadeOut } from 'react-native-reanimated';


// ── Main Dashboard ─────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user, refreshUser } = useAuth();
  const [miningTimer, setMiningTimer] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [netStats, setNetStats] = useState({ totalMined: 0, totalUsers: 0, activeNodes: 0 });
  const [activeMinerCount, setActiveMinerCount] = useState(0);
  const [blockHeight, setBlockHeight] = useState(0);
  const [tps, setTps] = useState(402000);
  const [isClaiming, setIsClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const { unreadCount } = useNotifications();

  const MAX_SESSION_TIME = 24 * 60 * 60;
  const referrals = Math.min(user?.referralCount || 0, MAX_REFERRALS);
  const currentHourlyRate = BASE_MINING_RATE + (referrals * REFERRAL_BOOST);
  const ratePerSecond = currentHourlyRate / 3600;

  useEffect(() => {
    const unsubStats = argusSynapse.subscribeToNetworkStats(s => setNetStats(s));
    const unsubMiners = onSnapshot(
      query(collection(db, 'users'), where('miningActive', '==', true)),
      snap => setActiveMinerCount(snap.size)
    );
    return () => { unsubStats(); unsubMiners(); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(calculateCurrentBlockHeight());
      setTps(Math.floor(402000 + Math.sin(Date.now() / 2000) * 15000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateProgress = useCallback(() => {
    if (!user?.miningActive || !user.miningStartTime) {
      setMiningTimer(0); setPendingPoints(0); return;
    }
    const elapsed = Math.floor((Date.now() - user.miningStartTime) / 1000);
    const clamped = Math.min(elapsed, MAX_SESSION_TIME);
    setMiningTimer(clamped);
    setPendingPoints(clamped * ratePerSecond);
  }, [user, ratePerSecond]);

  useEffect(() => {
    calculateProgress();
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, [calculateProgress]);

  const handleStartMining = async () => {
    if (!user) return;
    await haptics.medium();
    try {
      await argusSynapse.startMining(user.uid);
      refreshUser({ ...user, miningActive: true, miningStartTime: Date.now() });
      setToast({ message: 'Mining operations initialized.', type: 'info' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to initialize mining.', type: 'error' });
    }
  };

  const handleClaim = async () => {
    if (!user || pendingPoints === 0 || isClaiming) return;
    setIsClaiming(true);
    await haptics.premiumSuccess();
    try {
      await argusSynapse.stopMiningAndClaim(user.uid, pendingPoints);
      refreshUser({ ...user, miningActive: false, miningStartTime: null, points: user.points + pendingPoints });
      setPendingPoints(0); setMiningTimer(0);
      setToast({ message: `Successfully claimed ${pendingPoints.toFixed(2)} ARG.`, type: 'success' });
    } catch (e) {
      console.error(e);
      setToast({ message: 'Failed to claim rewards.', type: 'error' });
    }
    setIsClaiming(false);
  };

  const formatCountdown = (seconds: number) => {
    const r = Math.max(0, MAX_SESSION_TIME - seconds);
    const h = Math.floor(r / 3600), m = Math.floor((r % 3600) / 60), s = r % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isSessionComplete = miningTimer >= MAX_SESSION_TIME;
  const progress = (miningTimer / MAX_SESSION_TIME) * 100;
  const leftToMine = Math.max(0, TOTAL_SUPPLY - netStats.totalMined);

  if (!user) return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Skeleton width={150} height={24} />
          <Skeleton width={80} height={24} />
        </View>
        <View style={styles.statsGrid}>
          <Skeleton width={CARD_W} height={100} />
          <Skeleton width={CARD_W} height={100} />
          <Skeleton width={CARD_W} height={100} />
          <Skeleton width={CARD_W} height={100} />
        </View>
        <Skeleton width="100%" height={250} style={{ borderRadius: 24 }} />
        <Skeleton width="100%" height={180} style={{ borderRadius: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} tintColor={Colors.maroon} />}
      >
        {/* ── HEADER ── */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconBox}>
              <Activity size={18} color={Colors.maroon} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Network Operations</Text>
              <View style={styles.headerStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.headerStatusText}>
                  ACTIVE_KERNEL · {activeMinerCount.toLocaleString()} NODES
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.notificationBtn}
            >
              <Bell size={20} color={unreadCount > 0 ? Colors.maroon : Colors.zinc500} />
              {unreadCount > 0 && <View style={styles.unreadBadge} />}
            </TouchableOpacity>
            <View style={{ alignItems: 'flex-end', marginLeft: Spacing.md }}>
              <Text style={styles.headerMeta}># {blockHeight.toLocaleString()}</Text>
              <Text style={styles.headerMetaSub}>Block</Text>
            </View>
          </View>
        </View>

        {/* ── STAT CARDS GRID ── */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Mined ARG" icon={Activity}
            value={`${user.points.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ARG`}
            subValue="≈ $0.50/ARG"
          />
          <StatCard
            label="Unmined Supply" icon={Layers}
            value={`${(leftToMine / 1_000_000).toFixed(1)}M`}
            subValue={`Cap: 2B ARG`}
          />
          <StatCard
            label="TPS" icon={Zap}
            value={tps.toLocaleString()}
            subValue="Finality <400ms"
          />
          <StatCard
            label="Miners" icon={Server}
            value={activeMinerCount.toLocaleString()}
            subValue="Active Now"
          />
        </View>

        {/* ── GHOSTDAG VISUALIZER ── */}
        <GhostDAGViz />

        {/* ── MINING CONTROLLER ── */}
        <View style={styles.miningCard}>
          <View style={styles.miningCardGlow} pointerEvents="none" />

          <View style={styles.miningHeader}>
            <View>
              <Text style={styles.miningTitle}>Consensus Engine</Text>
              <View style={styles.miningStatus}>
                <View style={[styles.miningDot, user.miningActive && styles.miningDotActive]} />
                <Text style={styles.miningStatusText}>
                  {user.miningActive ? 'KERNEL_ACTIVE · SHA-256G' : 'NODE_STANDBY'}
                </Text>
              </View>
            </View>
            <View style={styles.miningYield}>
              <ProgressRing progress={progress} size={70} />
              <View style={styles.miningYieldOverlay}>
                <Text style={styles.miningYieldVal}>
                  {pendingPoints.toFixed(2)}
                </Text>
                <Text style={styles.miningYieldUnit}>ARG</Text>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(100, progress)}%` } as any,
            isSessionComplete && styles.progressBarComplete]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Rate: {currentHourlyRate.toFixed(2)} ARG/h</Text>
            <Text style={styles.progressLabel}>
              {isSessionComplete ? 'Session Complete ✓' : `T-minus: ${formatCountdown(miningTimer)}`}
            </Text>
          </View>

          {/* Action Button */}
          {user.miningActive ? (
            <TouchableOpacity
              style={[styles.actionBtn, isSessionComplete ? styles.actionBtnWhite : styles.actionBtnGhost]}
              onPress={handleClaim}
              disabled={isClaiming}
              activeOpacity={0.85}
            >
              {isClaiming
                ? <ActivityIndicator color={isSessionComplete ? Colors.black : Colors.maroon} />
                : <Text style={[styles.actionBtnText, !isSessionComplete && styles.actionBtnTextGhost]}>
                  {isSessionComplete ? '⚡ Secure Block' : 'Terminate & Claim'}
                </Text>
              }
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={handleStartMining}
              activeOpacity={0.85}
            >
              <Text style={styles.actionBtnText}>Initialize Node</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── CORE CAPABILITIES GRID ── */}
        <View style={styles.capsGrid}>
          {[
            { label: 'Security', value: 'RSA-4096-AES', icon: Shield },
            { label: 'Referrals', value: `${referrals}/${MAX_REFERRALS} ACTIVE`, icon: TrendingUp },
            { label: 'Protocol', value: 'v2.4.0', icon: Cpu },
            { label: 'Tasks Done', value: `${user.completedTasks?.length || 0} COMPLETE`, icon: Clock },
          ].map((cap) => (
            <View key={cap.label} style={styles.capCard}>
              <View style={styles.capIconBox}>
                <cap.icon size={13} color={Colors.zinc600} />
              </View>
              <Text style={styles.capLabel}>{cap.label}</Text>
              <Text style={styles.capValue} numberOfLines={1}>{cap.value}</Text>
            </View>
          ))}
        </View>

        {/* ── PROTOCOL ADVISORY ── */}
        <View style={styles.advisoryCard}>
          <AlertTriangle size={14} color={Colors.maroon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.advisoryTitle}>Protocol Advisory</Text>
            <Text style={styles.advisoryText}>
              Verification blocks require absolute consensus. Maintain continuous connectivity to optimize GhostDAG performance.
            </Text>
          </View>
        </View>
      </ScrollView>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}

const CARD_W = (width - 48 - 12) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.xl, paddingBottom: 100, gap: Spacing.lg },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerIconBox: {
    width: 40, height: 40, backgroundColor: Colors.zinc900, borderWidth: 1,
    borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 13, fontWeight: '900', color: Colors.white, letterSpacing: 0.5, textTransform: 'uppercase' },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.maroon, opacity: 0.9 },
  headerStatusText: { ...Typography.label, color: Colors.zinc500, fontSize: 8 },
  headerRight: { alignItems: 'flex-end' },
  headerMeta: { fontFamily: 'monospace', fontSize: 12, fontWeight: '800', color: Colors.maroon },
  headerMetaSub: { ...Typography.label, color: Colors.zinc600, fontSize: 7, marginTop: 2 },

  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.maroon,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: CARD_W, backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.zinc800 + '80', borderRadius: BorderRadius.xl,
    padding: Spacing.lg, gap: 6,
    ...Shadows.card,
  },
  statIconBox: {
    width: 32, height: 32, backgroundColor: Colors.zinc900, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.zinc800, justifyContent: 'center', alignItems: 'center',
  },
  statLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 8 },
  statValue: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900', color: Colors.white },
  statSub: { fontSize: 9, color: Colors.zinc600, fontWeight: '500' },

  ghostdagContainer: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800 + '50',
    borderRadius: BorderRadius.xxl, overflow: 'hidden',
  },
  ghostdagHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.zinc900,
    backgroundColor: Colors.black + '60',
  },
  ghostdagTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.maroon },
  ghostdagTitle: { ...Typography.label, color: Colors.zinc400, fontSize: 8 },
  ghostdagLatency: { ...Typography.label, color: Colors.zinc600, fontSize: 8 },
  ghostdagSvg: { backgroundColor: 'transparent' },
  ghostdagLegend: { flexDirection: 'row', gap: 16, padding: Spacing.md, paddingHorizontal: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendLabel: { fontSize: 8, fontFamily: 'monospace', color: Colors.zinc600 },

  miningCard: {
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800 + '50',
    borderRadius: BorderRadius.xxl, padding: Spacing.xl, gap: Spacing.lg, overflow: 'hidden',
    ...Shadows.card,
  },
  miningCardGlow: {
    position: 'absolute', top: -40, right: -40, width: 160, height: 160,
    backgroundColor: Colors.maroon, opacity: 0.04, borderRadius: 80,
  },
  miningHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miningTitle: { fontSize: 13, fontWeight: '900', color: Colors.white, letterSpacing: 0.5, textTransform: 'uppercase' },
  miningStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  miningDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.zinc700 },
  miningDotActive: { backgroundColor: Colors.maroon },
  miningStatusText: { ...Typography.label, color: Colors.zinc500, fontSize: 8 },
  miningYield: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  miningYieldOverlay: { position: 'absolute', alignItems: 'center' },
  miningYieldVal: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', color: Colors.white },
  miningYieldUnit: { fontSize: 8, color: Colors.zinc600, fontWeight: '700' },

  progressBarContainer: { height: 6, backgroundColor: Colors.zinc900, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: Colors.maroon, borderRadius: 3 },
  progressBarComplete: { backgroundColor: Colors.white },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { ...Typography.label, color: Colors.zinc500, fontSize: 8 },

  actionBtn: {
    height: 52, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
  },
  actionBtnPrimary: { backgroundColor: Colors.white },
  actionBtnWhite: { backgroundColor: Colors.white },
  actionBtnGhost: { borderWidth: 1, borderColor: Colors.zinc700, backgroundColor: 'transparent' },
  actionBtnText: { fontSize: 11, fontWeight: '900', color: Colors.black, letterSpacing: 1.5, textTransform: 'uppercase' },
  actionBtnTextGhost: { color: Colors.zinc400 },

  capsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  capCard: {
    width: CARD_W, backgroundColor: Colors.surface, borderWidth: 1,
    borderColor: Colors.zinc800 + '80', borderRadius: BorderRadius.xl, padding: Spacing.md, gap: 6,
  },
  capIconBox: {
    width: 28, height: 28, backgroundColor: Colors.zinc900, borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.zinc800, justifyContent: 'center', alignItems: 'center',
  },
  capLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 7 },
  capValue: { fontFamily: 'monospace', fontSize: 10, fontWeight: '900', color: Colors.white },

  advisoryCard: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    backgroundColor: Colors.maroon + '10', borderWidth: 1, borderColor: Colors.maroon + '25',
    borderRadius: BorderRadius.xl, padding: Spacing.lg,
  },
  advisoryTitle: { ...Typography.label, color: Colors.maroon, fontSize: 8, marginBottom: 4 },
  advisoryText: { fontSize: 9, color: Colors.zinc500, lineHeight: 14, fontFamily: 'monospace' },
});
