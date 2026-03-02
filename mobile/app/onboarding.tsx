
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    withSpring,
    withRepeat,
    Easing
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Colors } from '../theme';
import { ShieldCheck, Cpu, Globe, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const HAS_ONBOARDED_KEY = '@argus_has_onboarded';

const ONBOARDING_STEPS = [
    {
        title: 'Institutional Grade Security',
        subtitle: 'AES-GCM-256 encrypted protocols protecting your data at rest and in transit.',
        icon: ShieldCheck,
        color: Colors.maroon
    },
    {
        title: 'Parallel Compute Sharding',
        subtitle: 'Distribute network load across thousands of nodes for unprecedented TPS.',
        icon: Cpu,
        color: '#60a5fa'
    },
    {
        title: 'The GhostDAG Network',
        subtitle: 'A truly decentralized topology enabling sub-second consensus globally.',
        icon: Globe,
        color: '#a855f7'
    }
];

export default function OnboardingScreen() {
    const router = useRouter();
    const logoScale = useSharedValue(0.5);
    const logoOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(0);
    const contentTranslateY = useSharedValue(40);

    const bgPulse = useSharedValue(0.1);

    useEffect(() => {
        // Logo entrance
        logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
        logoOpacity.value = withTiming(1, { duration: 1000 });

        // Content entrance
        contentOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
        contentTranslateY.value = withDelay(800, withSpring(0, { damping: 15 }));

        // Background pulse
        bgPulse.value = withRepeat(
            withSequence(
                withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.05, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1, true
        );
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
        transform: [{ translateY: contentTranslateY.value }],
    }));

    const bgGlowStyle = useAnimatedStyle(() => ({
        opacity: bgPulse.value,
        transform: [{ scale: 1 + (bgPulse.value * 2) }],
    }));

    const handleContinue = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await AsyncStorage.setItem(HAS_ONBOARDED_KEY, 'true');
        router.replace('/login');
    };

    return (
        <View style={styles.container}>
            {/* Ambient Background Glow */}
            <Animated.View style={[styles.glowBlob, bgGlowStyle]} />
            <View style={styles.scanline} pointerEvents="none" />

            {/* TOP LOGO HERO */}
            <View style={styles.heroSection}>
                <Animated.View style={[styles.logoBox, logoStyle]}>
                    <View style={styles.logoInner}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                    <View style={styles.glowOverlay} />
                </Animated.View>
                <Animated.Text style={[styles.titleText, logoStyle]}>ARGUS PROTOCOL</Animated.Text>
                <Animated.Text style={[styles.subtitleText, logoStyle]}>The Parallel Protocol Infrastructure</Animated.Text>
            </View>

            {/* CONTENT SECTION */}
            <Animated.View style={[styles.contentSection, contentStyle]}>
                <BlurView intensity={40} tint="dark" style={styles.glassCard}>
                    {ONBOARDING_STEPS.map((step, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={[styles.iconBox, { borderColor: step.color + '40' }]}>
                                <View style={[styles.iconInner, { backgroundColor: step.color + '15' }]}>
                                    <step.icon size={22} color={step.color} />
                                </View>
                            </View>
                            <View style={styles.featureTextCol}>
                                <Text style={styles.featureTitle}>{step.title}</Text>
                                <Text style={styles.featureDesc}>{step.subtitle}</Text>
                            </View>
                        </View>
                    ))}
                </BlurView>

                {/* BOTTOM CTA */}
                <TouchableOpacity style={styles.ctaBtn} onPress={handleContinue} activeOpacity={0.8}>
                    <BlurView intensity={100} tint="dark" style={styles.ctaInner}>
                        <View style={styles.ctaContent}>
                            <Text style={styles.ctaText}>Initialize Node</Text>
                            <View style={styles.ctaIconBg}>
                                <ArrowRight size={18} color={Colors.white} />
                            </View>
                        </View>
                    </BlurView>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'space-between' },
    glowBlob: { position: 'absolute', top: -height * 0.1, left: -width * 0.3, width: width * 1.6, height: width * 1.6, borderRadius: width * 0.8, backgroundColor: Colors.maroon, filter: 'blur(100px)' },
    scanline: { position: 'absolute', inset: 0, opacity: 0.05, backgroundColor: 'rgba(255,255,255,0.1)', height: 2 },

    heroSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: height * 0.05 },
    logoBox: { width: 100, height: 100, borderRadius: 24, padding: 2, backgroundColor: Colors.zinc900, borderWidth: 1, borderColor: Colors.zinc800, marginBottom: 24, shadowColor: Colors.maroon, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 15 },
    logoInner: { flex: 1, backgroundColor: Colors.maroonBg, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.maroonBorder },
    logoText: { fontSize: 44, fontWeight: '900', color: Colors.maroon },
    glowOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 24, backgroundColor: Colors.maroon, opacity: 0.1 },
    titleText: { fontSize: 24, fontWeight: '900', color: Colors.white, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
    subtitleText: { fontSize: 13, color: Colors.zinc400, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'monospace' },

    contentSection: { padding: 24, paddingBottom: 48, gap: 32 },
    glassCard: { borderRadius: 32, padding: 24, gap: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.3)', overflow: 'hidden' },
    featureRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 16, borderWidth: 1, padding: 1 },
    iconInner: { flex: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    featureTextCol: { flex: 1, gap: 4 },
    featureTitle: { fontSize: 15, fontWeight: '800', color: Colors.white, letterSpacing: 0.5 },
    featureDesc: { fontSize: 12, color: Colors.zinc400, lineHeight: 18 },

    ctaBtn: { overflow: 'hidden', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 },
    ctaInner: { backgroundColor: 'rgba(128,0,0,0.4)', padding: 4 },
    ctaContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, paddingHorizontal: 24, gap: 12 },
    ctaText: { fontSize: 15, fontWeight: '900', color: Colors.white, letterSpacing: 1, textTransform: 'uppercase' },
    ctaIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});
