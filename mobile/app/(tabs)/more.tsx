
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Share, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import {
    Share2, Users, Zap, CheckCircle2, LogOut, Copy,
    TrendingUp, Crown, ShieldCheck,
} from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { MAX_REFERRALS, REFERRAL_BOOST, REFERRAL_BONUS_POINTS } from '../../constants';

export default function MoreScreen() {
    const { user, logout } = useAuth();
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const [referralLogs, setReferralLogs] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [loadingLB, setLoadingLB] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchReferrals = async () => {
            try {
                const q = query(collection(db, 'users'), where('referredBy', '==', user.uid));
                const snap = await getDocs(q);
                setReferralLogs(snap.docs.map(d => d.data()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
            } finally { setLoadingLogs(false); }
        };
        const fetchLeaderboard = async () => {
            try {
                const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
                const snap = await getDocs(q);
                setLeaderboard(snap.docs.map(d => d.data()));
            } finally { setLoadingLB(false); }
        };
        fetchReferrals();
        fetchLeaderboard();
    }, [user?.uid]);

    if (!user) return null;

    const activeRefs = Math.min(user.referralCount || 0, MAX_REFERRALS);
    const refLink = `https://argus.protocol/#/?ref=${user.referralCode}`;

    const shareLink = async () => {
        try {
            await Share.share({ message: `Join the Argus Protocol network and earn ARG! Use my referral link: ${refLink}`, url: refLink });
        } catch { }
    };

    const copyLink = async () => {
        await Clipboard.setStringAsync(refLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const copyCode = async () => {
        await Clipboard.setStringAsync(user.referralCode || '');
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to disconnect your node?',
            [{ text: 'Cancel', style: 'cancel' }, { text: 'Logout', style: 'destructive', onPress: logout }]
        );
    };

    const myRank = leaderboard.findIndex(u => u.uid === user.uid) + 1;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* ── USER CARD ── */}
                <View style={styles.userCard}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarChar}>
                            {(user.displayName || '?')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.displayName}</Text>
                        <Text style={styles.userPoints}>{user.points?.toFixed(2)} ARG</Text>
                    </View>
                    {myRank > 0 && (
                        <View style={styles.rankBadge}>
                            <Crown size={12} color={Colors.maroon} />
                            <Text style={styles.rankText}>#{myRank}</Text>
                        </View>
                    )}
                </View>

                {/* ── REFERRAL SECTION ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBox}>
                            <Users size={16} color={Colors.maroon} />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Authorization_Bridge</Text>
                            <Text style={styles.sectionSub}>{activeRefs}/{MAX_REFERRALS} peers synced</Text>
                        </View>
                    </View>

                    {/* Referral stats */}
                    <View style={styles.refStats}>
                        <View style={styles.refStatCard}>
                            <Text style={styles.refStatLabel}>Bonus Rate</Text>
                            <Text style={styles.refStatValue}>+{(activeRefs * REFERRAL_BOOST).toFixed(2)}</Text>
                            <Text style={styles.refStatUnit}>ARG/hr</Text>
                        </View>
                        <View style={styles.refStatCard}>
                            <Text style={styles.refStatLabel}>Total Earned</Text>
                            <Text style={styles.refStatValue}>+{(activeRefs * REFERRAL_BONUS_POINTS).toFixed(2)}</Text>
                            <Text style={styles.refStatUnit}>ARG</Text>
                        </View>
                        <View style={styles.refStatCard}>
                            <Text style={styles.refStatLabel}>Peers</Text>
                            <Text style={styles.refStatValue}>{activeRefs}</Text>
                            <Text style={styles.refStatUnit}>ACTIVE</Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View style={styles.refProgressBg}>
                        <View style={[styles.refProgressBar, { width: `${(activeRefs / MAX_REFERRALS) * 100}%` } as any]} />
                    </View>

                    {/* Referral code */}
                    <View style={styles.codeBox}>
                        <Text style={styles.codeLabel}>Unique Access Code</Text>
                        <Text style={styles.codeValue}>{user.referralCode}</Text>
                        <TouchableOpacity style={styles.codeBtn} onPress={copyCode} activeOpacity={0.8}>
                            {copiedCode ? <CheckCircle2 size={14} color={Colors.maroon} /> : <Copy size={14} color={Colors.zinc500} />}
                            <Text style={styles.codeBtnText}>{copiedCode ? 'Copied!' : 'Copy Code'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Share buttons */}
                    <View style={styles.shareRow}>
                        <TouchableOpacity style={styles.shareLinkBtn} onPress={copyLink} activeOpacity={0.8}>
                            {copiedLink ? <CheckCircle2 size={14} color={Colors.white} /> : <Copy size={14} color={Colors.white} />}
                            <Text style={styles.shareLinkBtnText}>{copiedLink ? 'Copied!' : 'Copy Link'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareBtn} onPress={shareLink} activeOpacity={0.8}>
                            <Share2 size={14} color={Colors.maroon} />
                            <Text style={styles.shareBtnText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── LEADERBOARD ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBox}>
                            <Crown size={16} color={Colors.maroon} />
                        </View>
                        <View>
                            <Text style={styles.sectionTitle}>Rank_Leaderboard</Text>
                            <Text style={styles.sectionSub}>Top 10 network operators</Text>
                        </View>
                    </View>

                    {loadingLB ? (
                        <ActivityIndicator color={Colors.maroon} style={{ marginVertical: 20 }} />
                    ) : (
                        leaderboard.map((op, i) => (
                            <View key={op.uid} style={[styles.lbRow, op.uid === user.uid && styles.lbRowMe]}>
                                <View style={styles.lbRankBox}>
                                    <Text style={[styles.lbRank, i < 3 && { color: Colors.maroon }]}>
                                        {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                                    </Text>
                                </View>
                                <View style={styles.lbAvatar}>
                                    <Text style={styles.lbAvatarChar}>
                                        {(op.displayName || '?')[0].toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.lbName} numberOfLines={1}>{op.displayName}</Text>
                                <Text style={styles.lbPoints}>
                                    {op.points?.toLocaleString(undefined, { maximumFractionDigits: 0 })} ARG
                                </Text>
                            </View>
                        ))
                    )}
                </View>

                {/* ── REFERRED USERS LOG ── */}
                {referralLogs.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Synchronization Logs</Text>
                        {loadingLogs ? <ActivityIndicator color={Colors.maroon} /> : (
                            referralLogs.slice(0, 5).map((log, i) => (
                                <View key={log.uid || i} style={styles.logRow}>
                                    <ShieldCheck size={14} color={Colors.zinc600} />
                                    <View style={styles.logInfo}>
                                        <Text style={styles.logName}>{log.displayName}</Text>
                                        <Text style={styles.logDate}>
                                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
                                        </Text>
                                    </View>
                                    <Text style={styles.logBonus}>+{REFERRAL_BONUS_POINTS.toFixed(2)} ARG</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {/* ── LOGOUT ── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
                    <LogOut size={16} color={Colors.error} />
                    <Text style={styles.logoutText}>Disconnect Node</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 100 },

    userCard: {
        flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.xl, padding: Spacing.lg,
    },
    userAvatar: {
        width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.maroonBg,
        borderWidth: 2, borderColor: Colors.maroonBorder, justifyContent: 'center', alignItems: 'center',
    },
    userAvatarChar: { fontSize: 22, fontWeight: '900', color: Colors.maroon },
    userInfo: { flex: 1 },
    userName: { fontSize: 16, fontWeight: '800', color: Colors.white },
    userPoints: { fontFamily: 'monospace', fontSize: 12, color: Colors.zinc400, marginTop: 2 },
    rankBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: Colors.maroonBg, borderWidth: 1, borderColor: Colors.maroonBorder,
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.lg,
    },
    rankText: { fontFamily: 'monospace', fontSize: 12, fontWeight: '900', color: Colors.maroon },

    section: {
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800 + '80',
        borderRadius: BorderRadius.xxl, padding: Spacing.xl, gap: Spacing.lg,
    },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    sectionIconBox: {
        width: 36, height: 36, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
    },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    sectionSub: { ...Typography.label, color: Colors.zinc600, fontSize: 8, marginTop: 2 },

    refStats: { flexDirection: 'row', gap: 12 },
    refStatCard: {
        flex: 1, backgroundColor: Colors.zinc900 + '80', borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.lg, padding: Spacing.md, gap: 2, alignItems: 'center',
    },
    refStatLabel: { fontSize: 8, fontWeight: '700', color: Colors.zinc600, textTransform: 'uppercase', letterSpacing: 0.5 },
    refStatValue: { fontFamily: 'monospace', fontSize: 18, fontWeight: '900', color: Colors.white },
    refStatUnit: { fontSize: 8, color: Colors.zinc600, fontWeight: '600' },

    refProgressBg: { height: 6, backgroundColor: Colors.zinc900, borderRadius: 3, overflow: 'hidden' },
    refProgressBar: { height: '100%', backgroundColor: Colors.maroon, borderRadius: 3 },

    codeBox: {
        backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.maroon + '30',
        borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: 8,
    },
    codeLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 8 },
    codeValue: { fontFamily: 'monospace', fontSize: 20, fontWeight: '900', color: Colors.maroon, letterSpacing: 3, textAlign: 'center' },
    codeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
    codeBtnText: { fontSize: 10, fontWeight: '700', color: Colors.zinc500, textTransform: 'uppercase', letterSpacing: 0.5 },

    shareRow: { flexDirection: 'row', gap: 12 },
    shareLinkBtn: {
        flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: Colors.maroon, borderRadius: BorderRadius.lg, paddingVertical: 14,
    },
    shareLinkBtnText: { fontSize: 11, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    shareBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: Colors.maroonBg, borderWidth: 1, borderColor: Colors.maroonBorder,
        borderRadius: BorderRadius.lg, paddingVertical: 14,
    },
    shareBtnText: { fontSize: 11, fontWeight: '700', color: Colors.maroon, textTransform: 'uppercase', letterSpacing: 0.5 },

    lbRow: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.zinc900 + '40',
    },
    lbRowMe: { backgroundColor: Colors.maroonBg, borderRadius: BorderRadius.lg, paddingHorizontal: 8 },
    lbRankBox: { width: 28 },
    lbRank: { fontFamily: 'monospace', fontSize: 12, fontWeight: '800', color: Colors.zinc500, textAlign: 'center' },
    lbAvatar: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.zinc800,
        justifyContent: 'center', alignItems: 'center',
    },
    lbAvatarChar: { fontSize: 12, fontWeight: '800', color: Colors.white },
    lbName: { flex: 1, fontSize: 13, fontWeight: '700', color: Colors.white },
    lbPoints: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: Colors.zinc400 },

    logRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logInfo: { flex: 1 },
    logName: { fontSize: 13, fontWeight: '700', color: Colors.white },
    logDate: { fontSize: 10, color: Colors.zinc600, marginTop: 2 },
    logBonus: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', color: Colors.maroon },

    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        borderWidth: 1, borderColor: Colors.error + '30', borderRadius: BorderRadius.xl,
        backgroundColor: Colors.error + '08', paddingVertical: 16,
    },
    logoutText: { fontSize: 13, fontWeight: '800', color: Colors.error, textTransform: 'uppercase', letterSpacing: 0.5 },
});
