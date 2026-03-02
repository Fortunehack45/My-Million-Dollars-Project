
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, ActivityIndicator, Dimensions, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { auth, db } from '../services/firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Google } from '@expo/vector-icons';
import { Zap, Shield, Server, Globe } from 'lucide-react-native';
import { onSnapshot, doc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

// Fallback for Google Sign-In without native module
async function signInWithGoogle() {
    try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        GoogleSignin.configure({
            webClientId: '803748553158-xxxx.apps.googleusercontent.com',
        });
        const userInfo = await GoogleSignin.signIn();
        const googleCredential = GoogleAuthProvider.credential(userInfo.data?.idToken ?? '');
        return signInWithCredential(auth, googleCredential);
    } catch (e: any) {
        throw new Error('Google Sign-In failed: ' + e.message);
    }
}

export default function LoginScreen() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const bootAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Telemetry stats  
    const [netStats, setNetStats] = useState({ totalUsers: 0, activeNodes: 0 });

    useEffect(() => {
        // Boot sequence animation
        Animated.timing(bootAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
        }).start();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Subscribe to network stats
        const unsub = onSnapshot(doc(db, 'global_stats', 'network'), (snap) => {
            if (snap.exists()) setNetStats(snap.data() as any);
        });
        return unsub;
    }, []);

    const handleGoogleSignIn = async () => {
        if (isSignUp && !acceptedTerms) {
            setError('Please accept the Terms & Conditions to continue.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            // Auth state change will redirect via _layout.tsx
        } catch (e: any) {
            setError(e.message || 'Sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const bootWidth = bootAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

                {/* Top Telemetry Strip */}
                <View style={styles.telemetryStrip}>
                    <View style={styles.telemetryItem}>
                        <Globe size={10} color={Colors.zinc600} />
                        <Text style={styles.telemetryLabel}>REGION: AWS-EAST-1</Text>
                    </View>
                    <View style={[styles.dot, styles.dotPulse]} />
                    <Text style={[styles.telemetryLabel, { color: Colors.maroon }]}>
                        SECURE_PROTOCOL_V2
                    </Text>
                </View>

                {/* Logo + Brand */}
                <View style={styles.header}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoChar}>A</Text>
                    </View>
                    <View>
                        <Text style={styles.brandName}>Argus Protocol</Text>
                        <Text style={styles.brandSub}>Infrastructure Authorization Service</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {[
                        { label: 'Network Nodes', value: netStats.totalUsers.toLocaleString(), icon: Shield },
                        { label: 'Active Mining', value: netStats.activeNodes.toLocaleString(), icon: Zap },
                        { label: 'Protocol', value: 'v2.4.0', icon: Server },
                        { label: 'Security', value: 'RSA-4096', icon: Shield },
                    ].map((stat, i) => (
                        <View key={i} style={styles.statCard}>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Boot Sequence */}
                <View style={styles.bootPanel}>
                    <View style={styles.bootHeader}>
                        <Text style={styles.bootTitle}>Handshake_Sequence</Text>
                        <Text style={styles.bootPid}>PID: 8042</Text>
                    </View>
                    <View style={styles.bootLogs}>
                        <Text style={styles.bootLog}><Text style={styles.bootOk}>OK</Text>  Booting Argus Kernel v2.4.0...</Text>
                        <Text style={styles.bootLog}><Text style={styles.bootOk}>OK</Text>  Initializing encrypted tunnel layers...</Text>
                        <Text style={styles.bootLog}><Text style={styles.bootWarn}>!!</Text>  Waiting for Operator Credentials</Text>
                    </View>
                    <View style={styles.bootBarContainer}>
                        <Animated.View style={[styles.bootBar, { width: bootWidth }]} />
                    </View>
                </View>

                {/* Auth Card */}
                <View style={styles.authCard}>
                    <Text style={styles.authTitle}>Access_Authority</Text>
                    <Text style={styles.authSub}>
                        Authorized operators only. Connect your system identity to begin node validation.
                    </Text>

                    {/* Network capacity badge */}
                    <View style={styles.capacityBadge}>
                        <View style={[styles.dot, styles.dotMaroon]} />
                        <Text style={styles.capacityText}>
                            NETWORK CAPACITY: <Text style={{ color: Colors.maroon }}>{Math.max(0, 500000 - netStats.totalUsers).toLocaleString()}</Text> SPOTS REMAINING
                        </Text>
                    </View>

                    {/* Terms acceptance (sign-up mode) */}
                    {isSignUp && (
                        <TouchableOpacity
                            style={[styles.termsRow, acceptedTerms && styles.termsRowActive]}
                            onPress={() => setAcceptedTerms(!acceptedTerms)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Google Sign-In Button */}
                    <TouchableOpacity
                        style={[
                            styles.googleBtn,
                            (isSignUp && !acceptedTerms) && styles.googleBtnDisabled
                        ]}
                        onPress={handleGoogleSignIn}
                        disabled={loading || (isSignUp && !acceptedTerms)}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                        ) : (
                            <>
                                <View style={styles.googleIcon}>
                                    <Text style={styles.googleG}>G</Text>
                                </View>
                                <View style={styles.googleTextWrap}>
                                    <Text style={styles.googleBtnText}>
                                        {isSignUp ? 'Sign Up with Google' : 'Log in with Google'}
                                    </Text>
                                    <Text style={styles.googleBtnSub}>Encrypted · RSA-4096 · Zero-trust handshake</Text>
                                </View>
                                <Text style={styles.googleArrow}>›</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Toggle mode */}
                    <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(''); }}>
                        <Text style={styles.toggleText}>
                            {isSignUp ? '← Already authorized? Initialize Login' : 'No identity? Request Access (Sign Up) →'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Server size={10} color={Colors.zinc800} />
                    <Text style={styles.footerText}>SYSTEM: OPERATIONAL</Text>
                </View>
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, padding: Spacing.xl },

    telemetryStrip: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.xl,
        paddingTop: Platform.OS === 'ios' ? 44 : 24,
    },
    telemetryItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    telemetryLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.maroon },
    dotPulse: { opacity: 0.8 },
    dotMaroon: { backgroundColor: Colors.maroon },

    header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
    logoBox: {
        width: 40, height: 40, borderWidth: 1, borderColor: Colors.maroon,
        backgroundColor: Colors.maroonBg, justifyContent: 'center', alignItems: 'center',
    },
    logoChar: { fontSize: 24, color: Colors.maroon, fontWeight: '900' },
    brandName: { fontSize: 18, fontWeight: '800', color: Colors.white },
    brandSub: { ...Typography.label, color: Colors.zinc600, fontSize: 8, marginTop: 2 },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 1, marginBottom: Spacing.xl, backgroundColor: Colors.zinc800 },
    statCard: { width: (width - 48 - 1) / 2, backgroundColor: Colors.surface, padding: Spacing.lg },
    statLabel: { ...Typography.label, color: Colors.zinc600, fontSize: 7, marginBottom: 4 },
    statValue: { fontSize: 12, fontFamily: 'monospace', fontWeight: '800', color: Colors.white },

    bootPanel: {
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800,
        padding: Spacing.lg, marginBottom: Spacing.xl,
    },
    bootHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
    bootTitle: { ...Typography.label, color: Colors.zinc400, fontSize: 8 },
    bootPid: { ...Typography.label, color: Colors.zinc700, fontSize: 8 },
    bootLogs: { gap: 4, marginBottom: Spacing.md },
    bootLog: { fontFamily: 'monospace', fontSize: 9, color: Colors.zinc600 },
    bootOk: { color: Colors.white, fontWeight: '800' },
    bootWarn: { color: Colors.maroon, fontWeight: '800' },
    bootBarContainer: { height: 2, backgroundColor: Colors.zinc800, borderRadius: 1, overflow: 'hidden' },
    bootBar: { height: '100%', backgroundColor: Colors.maroon, borderRadius: 1 },

    authCard: {
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.xl, padding: Spacing.xl, gap: Spacing.lg,
        marginBottom: Spacing.xl,
    },
    authTitle: { fontSize: 28, fontWeight: '900', color: Colors.white, fontStyle: 'italic', letterSpacing: -0.5 },
    authSub: { fontSize: 13, color: Colors.zinc500, lineHeight: 20 },
    capacityBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: Colors.maroonBg, borderWidth: 1, borderColor: Colors.maroonBorder,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: BorderRadius.md, alignSelf: 'flex-start',
    },
    capacityText: { fontSize: 8, fontWeight: '700', color: Colors.white, letterSpacing: 0.5 },

    termsRow: {
        flexDirection: 'row', gap: 12, padding: Spacing.md, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg, alignItems: 'flex-start',
    },
    termsRowActive: { borderColor: Colors.maroon + '50' },
    checkbox: {
        width: 16, height: 16, borderWidth: 1.5, borderColor: Colors.zinc700,
        borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginTop: 1,
    },
    checkboxChecked: { backgroundColor: Colors.maroon, borderColor: Colors.maroon },
    checkmark: { color: Colors.white, fontSize: 10, fontWeight: '900' },
    termsText: { flex: 1, fontSize: 12, color: Colors.zinc400, lineHeight: 18 },
    termsLink: { color: Colors.white, textDecorationLine: 'underline' },

    googleBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        backgroundColor: Colors.zinc900, borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.xl, padding: Spacing.lg,
    },
    googleBtnDisabled: { opacity: 0.4 },
    googleIcon: {
        width: 40, height: 40, backgroundColor: Colors.white,
        borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center',
    },
    googleG: { fontSize: 22, fontWeight: '900', color: '#4285F4' },
    googleTextWrap: { flex: 1 },
    googleBtnText: { fontSize: 11, fontWeight: '900', color: Colors.white, letterSpacing: 1, textTransform: 'uppercase' },
    googleBtnSub: { fontSize: 8, color: Colors.zinc600, marginTop: 2 },
    googleArrow: { fontSize: 20, color: Colors.zinc700 },

    errorText: { fontSize: 12, color: Colors.error, textAlign: 'center' },
    toggleText: {
        fontSize: 10, fontFamily: 'monospace', fontWeight: '700', color: Colors.zinc500,
        textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase',
    },

    footer: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingBottom: 32 },
    footerText: { fontSize: 8, fontWeight: '700', color: Colors.zinc800, letterSpacing: 1, textTransform: 'uppercase' },
});
