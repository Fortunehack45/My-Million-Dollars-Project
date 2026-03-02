
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    RefreshControl, ActivityIndicator, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { argusSynapse } from '../../services/ArgusSynapseService';
import { Task } from '../../types';
import { ShieldCheck, Globe, Timer, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

function TaskItem({ task, user, onComplete }: { task: Task; user: any; onComplete: (t: Task) => void }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [canClaim, setCanClaim] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isCompleted = user.completedTasks?.includes(task.id);
    const waitTime = task.verificationWaitTime || 8;

    useEffect(() => {
        if (!task.expiresAt) { setTimeLeft(null); return; }
        const update = () => {
            const diff = Math.max(0, task.expiresAt! - Date.now());
            if (diff === 0) { setTimeLeft('EXPIRED'); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            setTimeLeft(h > 0 ? `${h}H ${m}M` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => { clearInterval(interval); if (timerRef.current) clearTimeout(timerRef.current); };
    }, [task.expiresAt]);

    const handleStart = async () => {
        await Linking.openURL(task.link);
        setIsVerifying(true);
        timerRef.current = setTimeout(() => { setIsVerifying(false); setCanClaim(true); }, waitTime * 1000);
    };

    const icon = task.icon === 'twitter' ? '𝕏' : task.icon === 'telegram' ? '✈' : '🌐';

    return (
        <View style={[styles.taskCard, isCompleted && styles.taskCardDone]}>
            <View style={styles.taskLeft}>
                <View style={[styles.taskIconBox, isCompleted && styles.taskIconBoxDone]}>
                    <Text style={styles.taskEmoji}>{isCompleted ? '✓' : icon}</Text>
                </View>
            </View>
            <View style={styles.taskBody}>
                <View style={styles.taskMeta}>
                    <Text style={styles.taskId}>DIR-{task.id.slice(0, 4)}</Text>
                    {timeLeft && timeLeft !== 'EXPIRED' && !isCompleted && (
                        <View style={styles.expiryBadge}>
                            <Clock size={9} color={timeLeft.includes('H') ? Colors.zinc500 : Colors.error} />
                            <Text style={[styles.expiryText, !timeLeft.includes('H') && { color: Colors.error }]}>
                                {timeLeft}
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.taskTitle, isCompleted && styles.taskTitleDone]}>{task.title}</Text>
                <Text style={styles.taskDesc} numberOfLines={2}>{task.description}</Text>
                <View style={styles.taskFooter}>
                    <Text style={styles.taskPoints}>+{task.points.toFixed(2)} ARG</Text>
                    {isCompleted ? (
                        <View style={styles.validatedBadge}>
                            <CheckCircle2 size={12} color={Colors.maroon} />
                            <Text style={styles.validatedText}>Validated</Text>
                        </View>
                    ) : timeLeft === 'EXPIRED' ? (
                        <View style={styles.closedBadge}><Text style={styles.closedText}>Closed</Text></View>
                    ) : canClaim ? (
                        <TouchableOpacity style={styles.claimBtn} onPress={() => onComplete(task)} activeOpacity={0.8}>
                            <Text style={styles.claimBtnText}>Claim</Text>
                            <ArrowRight size={12} color={Colors.white} />
                        </TouchableOpacity>
                    ) : isVerifying ? (
                        <View style={styles.verifyingBadge}>
                            <ActivityIndicator size="small" color={Colors.warning} />
                            <Text style={styles.verifyingText}>Verifying…</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
                            <Text style={styles.startBtnText}>Start Task</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

export default function TasksScreen() {
    const { user, refreshUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadTasks = () => {
        return argusSynapse.subscribeToTasks((data) => {
            setTasks(data);
            setLoading(false);
            setRefreshing(false);
        });
    };

    useEffect(() => {
        const unsub = loadTasks();
        return unsub;
    }, []);

    const handleComplete = async (task: Task) => {
        if (!user || user.completedTasks?.includes(task.id)) return;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await argusSynapse.completeSocialTask(user.uid, task.id, task.points);
            refreshUser({
                ...user,
                points: user.points + task.points,
                completedTasks: [...(user.completedTasks || []), task.id],
            });
        } catch (e) { console.error(e); }
    };

    const completedCount = tasks.filter(t => user?.completedTasks?.includes(t.id)).length;

    if (!user) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconBox}>
                        <ShieldCheck size={18} color={Colors.maroon} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Operational_Tasks</Text>
                        <View style={styles.headerSub}>
                            <View style={styles.subDot} />
                            <Text style={styles.headerSubText}>SECURITY_CLEARANCE: ALPHA_ONE</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.countText}>{completedCount}/{tasks.length}</Text>
                    <Text style={styles.countLabel}>SYNCED</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={Colors.maroon} size="large" />
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    keyExtractor={t => t.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); loadTasks(); }}
                            tintColor={Colors.maroon}
                        />
                    }
                    renderItem={({ item }) => (
                        <TaskItem task={item} user={user} onComplete={handleComplete} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <ShieldCheck size={32} color={Colors.zinc700} />
                            <Text style={styles.emptyTitle}>No active directives</Text>
                            <Text style={styles.emptyText}>Check back later for new tasks.</Text>
                        </View>
                    }
                    ListFooterComponent={tasks.length > 0 ? (
                        <View style={styles.advisory}>
                            <AlertCircle size={13} color={Colors.warning} style={{ opacity: 0.6 }} />
                            <Text style={styles.advisoryText}>
                                Verification protocols run asynchronously. Keep the app open during active timers.
                            </Text>
                        </View>
                    ) : null}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.zinc900,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    headerIconBox: {
        width: 40, height: 40, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 13, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    headerSub: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
    subDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.maroon },
    headerSubText: { ...Typography.label, color: Colors.zinc500, fontSize: 7 },
    headerRight: { alignItems: 'flex-end' },
    countText: { fontFamily: 'monospace', fontSize: 14, fontWeight: '900', color: Colors.white },
    countLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 7, marginTop: 2 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: 100 },

    taskCard: {
        flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.surface,
        borderWidth: 1, borderColor: Colors.zinc800 + '80', borderRadius: BorderRadius.xxl, padding: Spacing.lg,
    },
    taskCardDone: { opacity: 0.45 },
    taskLeft: {},
    taskIconBox: {
        width: 48, height: 48, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center',
    },
    taskIconBoxDone: { backgroundColor: Colors.maroonBg, borderColor: Colors.maroon + '30' },
    taskEmoji: { fontSize: 22 },

    taskBody: { flex: 1, gap: 6 },
    taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    taskId: { ...Typography.label, color: Colors.zinc600, fontSize: 8, backgroundColor: Colors.zinc900 + '80', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: Colors.zinc800 },
    expiryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    expiryText: { fontSize: 9, fontFamily: 'monospace', fontWeight: '700', color: Colors.zinc500 },
    taskTitle: { fontSize: 14, fontWeight: '800', color: Colors.white },
    taskTitleDone: { textDecorationLine: 'line-through', color: Colors.zinc500 },
    taskDesc: { fontSize: 11, color: Colors.zinc500, lineHeight: 16 },
    taskFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    taskPoints: { fontFamily: 'monospace', fontWeight: '700', fontSize: 12, color: Colors.maroon },
    validatedBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.maroonBg, borderWidth: 1, borderColor: Colors.maroonBorder, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.md },
    validatedText: { fontSize: 9, fontWeight: '700', color: Colors.maroon, textTransform: 'uppercase', letterSpacing: 0.5 },
    closedBadge: { backgroundColor: Colors.zinc900, borderWidth: 1, borderColor: Colors.zinc800, paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.md, opacity: 0.5 },
    closedText: { fontSize: 9, fontWeight: '700', color: Colors.zinc500, textTransform: 'uppercase' },
    claimBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.maroon, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
    claimBtnText: { fontSize: 10, fontWeight: '900', color: Colors.white, textTransform: 'uppercase', letterSpacing: 0.5 },
    verifyingBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.zinc900, borderWidth: 1, borderColor: Colors.zinc800, paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md },
    verifyingText: { fontSize: 9, fontWeight: '700', color: Colors.warning, textTransform: 'uppercase' },
    startBtn: { backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
    startBtnText: { fontSize: 10, fontWeight: '900', color: Colors.black, textTransform: 'uppercase', letterSpacing: 0.5 },

    empty: { alignItems: 'center', gap: 12, paddingVertical: 60 },
    emptyTitle: { fontSize: 15, fontWeight: '800', color: Colors.white },
    emptyText: { fontSize: 12, color: Colors.zinc600 },
    advisory: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: Colors.warning + '08', borderWidth: 1, borderColor: Colors.warning + '15', borderRadius: BorderRadius.lg, padding: Spacing.md, marginTop: Spacing.md },
    advisoryText: { flex: 1, fontSize: 10, color: Colors.warning, opacity: 0.6, lineHeight: 16, textTransform: 'uppercase', letterSpacing: 0.3 },
});
