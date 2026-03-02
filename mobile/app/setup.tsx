
import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ActivityIndicator, ScrollView, Platform, Animated
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import {
    doc, setDoc, getDoc, collection, query,
    where, getDocs, updateDoc, increment
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { ArgusSynapseService } from '../services/ArgusSynapseService';
import { EthereumService } from '../services/EthereumService';
import { Terminal, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react-native';

async function checkUsernameTaken(username: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('displayName', '==', username));
    const snap = await getDocs(q);
    return !snap.empty;
}

async function validateReferralCode(code: string): Promise<string | null> {
    const q = query(collection(db, 'users'), where('referralCode', '==', code));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].id;
}

export default function SetupScreen() {
    const { firebaseUser, refreshUser } = useAuth();
    const [username, setUsername] = useState('');
    const [refCode, setRefCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkingName, setCheckingName] = useState(false);
    const [isNameTaken, setIsNameTaken] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Debounced username check
    useEffect(() => {
        if (username.length < 3) { setIsNameTaken(null); return; }
        const timer = setTimeout(async () => {
            setCheckingName(true);
            try {
                const taken = await checkUsernameTaken(username);
                setIsNameTaken(taken);
            } finally { setCheckingName(false); }
        }, 600);
        return () => clearTimeout(timer);
    }, [username]);

    const handleSubmit = async () => {
        if (!firebaseUser || !username || isNameTaken !== false) return;
        setIsSubmitting(true);
        setError(null);
        try {
            let referrerUid: string | null = null;
            if (refCode.trim()) {
                referrerUid = await validateReferralCode(refCode.trim());
                if (!referrerUid) { setError('Invalid referral code.'); setIsSubmitting(false); return; }
            }

            const initialPoints = referrerUid ? 15 : 5;
            const referralCode = 'ARG-' + Math.random().toString(36).slice(2, 8).toUpperCase();
            const argAddress = ArgusSynapseService.generateAddress(firebaseUser.uid);
            const ethAddress = EthereumService.generateAddress(firebaseUser.uid);

            const profile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: username,
                photoURL: firebaseUser.photoURL || '',
                points: initialPoints,
                referralCode,
                referralCount: 0,
                referredBy: referrerUid,
                completedTasks: [],
                miningActive: false,
                miningStartTime: null,
                argAddress,
                ethAddress,
                createdAt: Date.now(),
            };

            await setDoc(doc(db, 'users', firebaseUser.uid), profile);

            // Credit referrer if applicable
            if (referrerUid) {
                try {
                    await updateDoc(doc(db, 'users', referrerUid), {
                        referralCount: increment(1),
                        points: increment(0.5),
                    });
                } catch { /* non-critical */ }
            }

            // Update global user count
            try {
                await updateDoc(doc(db, 'global_stats', 'network'), { totalUsers: increment(1) });
            } catch { /* non-critical */ }

            refreshUser(profile as any);
        } catch (err: any) {
            setError(err.message || 'Setup failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = username.length >= 3 && isNameTaken === false && !isSubmitting && !checkingName;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} bounces={false}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <Terminal size={22} color={Colors.white} />
                    </View>
                    <Text style={styles.title}>Initialize Node</Text>
                    <Text style={styles.subtitle}>Configure your operator identity to begin.</Text>
                </View>

                {/* Form Card */}
                <View style={styles.card}>
                    {/* Maroon glow */}
                    <View style={styles.cardGlow} pointerEvents="none" />

                    {/* Username */}
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Operator Handle</Text>
                        <View style={styles.inputRow}>
                            <Terminal size={14} color={Colors.zinc500} style={styles.inputIcon} />
                            <TextInput
                                style={[
                                    styles.input,
                                    isNameTaken === true && styles.inputError,
                                    isNameTaken === false && styles.inputSuccess,
                                ]}
                                placeholder="username"
                                placeholderTextColor={Colors.zinc700}
                                value={username}
                                onChangeText={(t) => {
                                    setUsername(t.replace(/[^a-zA-Z0-9_]/g, ''));
                                    setError(null);
                                }}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {checkingName && <ActivityIndicator size="small" color={Colors.zinc500} />}
                            {!checkingName && isNameTaken === false && (
                                <CheckCircle2 size={15} color={Colors.maroon} />
                            )}
                        </View>
                        <View style={styles.fieldStatus}>
                            {isNameTaken === true && (
                                <Text style={styles.statusError}>Handle_Denied – Already Claimed</Text>
                            )}
                            {isNameTaken === false && (
                                <Text style={styles.statusSuccess}>Handle_Authorized</Text>
                            )}
                        </View>
                    </View>

                    {/* Referral Code */}
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>
                            Referral Code <Text style={styles.fieldOptional}>(Optional · +10 ARG bonus)</Text>
                        </Text>
                        <View style={styles.inputRow}>
                            <ShieldCheck size={14} color={Colors.zinc500} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="ARG-XXXX"
                                placeholderTextColor={Colors.zinc700}
                                value={refCode}
                                onChangeText={(t) => setRefCode(t.toUpperCase())}
                                autoCapitalize="characters"
                                autoCorrect={false}
                            />
                        </View>
                    </View>

                    {/* Error */}
                    {error && (
                        <View style={styles.errorBox}>
                            <AlertCircle size={14} color={Colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        activeOpacity={0.85}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color={Colors.black} size="small" />
                        ) : (
                            <>
                                <Text style={styles.submitBtnText}>Initialize_Node</Text>
                                <ArrowRight size={18} color={Colors.black} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.disclaimer}>
                    By initializing, you agree to the Argus Protocol Terms and Conditions.
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, padding: Spacing.xl, paddingTop: Platform.OS === 'ios' ? 60 : 40 },

    header: { alignItems: 'center', marginBottom: Spacing.xxl, gap: Spacing.md },
    iconBox: {
        width: 52, height: 52, backgroundColor: Colors.zinc900, borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg,
        justifyContent: 'center', alignItems: 'center', marginBottom: 4,
    },
    title: { fontSize: 26, fontWeight: '900', color: Colors.white, fontStyle: 'italic', letterSpacing: -0.5, textTransform: 'uppercase' },
    subtitle: { fontSize: 13, color: Colors.zinc500 },

    card: {
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.zinc800,
        borderRadius: BorderRadius.xxl, padding: Spacing.xl, gap: Spacing.xl,
        marginBottom: Spacing.xl, overflow: 'hidden',
    },
    cardGlow: {
        position: 'absolute', top: 0, right: 0, width: 140, height: 140,
        backgroundColor: Colors.maroon, opacity: 0.04,
        borderRadius: 70,
    },

    field: { gap: 8 },
    fieldLabel: { fontSize: 12, fontWeight: '500', color: Colors.zinc400, marginLeft: 4 },
    fieldOptional: { color: Colors.zinc600 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: Colors.zinc900 + '80', borderWidth: 1,
        borderColor: Colors.zinc800, borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md, paddingVertical: 12,
    },
    inputIcon: { marginRight: 2 },
    input: { flex: 1, fontSize: 13, color: Colors.white, fontFamily: 'monospace' },
    inputError: { borderColor: Colors.error + '80' },
    inputSuccess: { borderColor: Colors.maroon + '80' },
    fieldStatus: { height: 16, paddingLeft: 4 },
    statusError: { ...Typography.label, color: Colors.error, fontSize: 8 },
    statusSuccess: { ...Typography.label, color: Colors.maroon, fontSize: 8 },

    errorBox: {
        flexDirection: 'row', gap: 8, alignItems: 'center', padding: Spacing.md,
        backgroundColor: Colors.error + '15', borderWidth: 1,
        borderColor: Colors.error + '30', borderRadius: BorderRadius.md,
    },
    errorText: { flex: 1, fontSize: 11, color: Colors.error },

    submitBtn: {
        backgroundColor: Colors.white, borderRadius: BorderRadius.lg,
        paddingVertical: 16, flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', gap: 8,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText: { fontSize: 11, fontWeight: '900', color: Colors.black, letterSpacing: 1.5, textTransform: 'uppercase' },

    disclaimer: { fontSize: 11, color: Colors.zinc600, textAlign: 'center', lineHeight: 18 },
});
