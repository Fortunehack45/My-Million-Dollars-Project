import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    FadeInDown,
    FadeOutDown,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const { width } = Dimensions.get('window');

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    onClose,
    duration = 3000,
}) => {
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        const timer = setTimeout(() => {
            dismiss();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onClose)();
        });
    };

    const gesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 50 || event.velocityY > 500) {
                translateY.value = withTiming(200, { duration: 200 }, () => {
                    runOnJS(onClose)();
                });
            } else {
                translateY.value = withSpring(0);
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    const icons = {
        info: <Info size={20} color={Colors.white} />,
        success: <CheckCircle size={20} color={Colors.white} />,
        warning: <AlertCircle size={20} color={Colors.maroon} />,
        error: <XCircle size={20} color={Colors.maroon} />,
    };

    const bgColors = {
        info: 'rgba(24, 24, 27, 0.8)',
        success: 'rgba(16, 185, 129, 0.2)',
        warning: 'rgba(245, 158, 11, 0.2)',
        error: 'rgba(128, 0, 0, 0.2)',
    };

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                entering={FadeInDown.springify().damping(15)}
                exiting={FadeOutDown}
                style={[styles.container, animatedStyle]}
            >
                <BlurView intensity={20} tint="dark" style={styles.blur}>
                    <View style={[styles.border, { borderColor: type === 'error' ? 'rgba(128,0,0,0.3)' : 'rgba(255,255,255,0.08)' }]} />
                    <View style={[styles.content, { backgroundColor: bgColors[type] }]}>
                        <View style={styles.iconContainer}>
                            {icons[type]}
                        </View>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    <View style={styles.handle} />
                </BlurView>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 50,
        left: 16,
        right: 16,
        zIndex: 9999,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        ...Shadows.card,
    },
    blur: {
        padding: 1,
    },
    border: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 1,
        borderRadius: BorderRadius.xl,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        paddingRight: Spacing.xl,
        borderRadius: BorderRadius.xl - 1,
    },
    iconContainer: {
        marginRight: Spacing.md,
    },
    message: {
        ...Typography.bodyLG,
        color: Colors.white,
        flex: 1,
        lineHeight: 20,
    },
    handle: {
        width: 32,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        alignSelf: 'center',
        position: 'absolute',
        bottom: 6,
    },
});

export default Toast;
