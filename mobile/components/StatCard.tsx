import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { BlurView } from 'expo-blur';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    FadeInUp
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 12) / 2;

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    icon: any;
    onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    icon: Icon,
    onPress
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96);
        opacity.value = withTiming(0.9);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
    };

    return (
        <Animated.View
            entering={FadeInUp.duration(600).springify()}
            style={[styles.container, animatedStyle]}
        >
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={styles.pressable}
            >
                <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.glassBorder} />

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.statIconBox}>
                            <Icon size={14} color={Colors.maroon} />
                        </View>
                        <Text style={styles.statLabel}>{label}</Text>
                    </View>

                    <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
                    {subValue ? (
                        <Text style={styles.statSub} numberOfLines={1}>{subValue}</Text>
                    ) : null}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_W,
        height: 110,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        backgroundColor: 'rgba(20, 20, 24, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        ...Shadows.card,
    },
    pressable: {
        flex: 1,
        padding: Spacing.lg,
    },
    glassBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: BorderRadius.xl,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIconBox: {
        width: 28,
        height: 28,
        backgroundColor: 'rgba(128, 0, 0, 0.1)',
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(128, 0, 0, 0.2)',
    },
    statLabel: {
        ...Typography.label,
        color: Colors.zinc500,
        fontSize: 7,
    },
    statValue: {
        fontFamily: 'monospace',
        fontSize: 15,
        fontWeight: '900',
        color: Colors.white,
        marginTop: 4,
    },
    statSub: {
        fontSize: 10,
        color: Colors.zinc600,
        fontWeight: '600',
        marginTop: 2,
    },
});

export default StatCard;
