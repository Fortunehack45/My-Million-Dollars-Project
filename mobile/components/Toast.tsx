import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { Info, CheckCircle, AlertCircle, XCircle } from 'lucide-react-native';

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
    duration = 3000
}) => {
    const slideAnim = useRef(new Animated.Value(100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        const timer = setTimeout(() => {
            hide();
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const hide = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start(() => onClose());
    };

    const icons = {
        info: <Info size={18} color={Colors.white} />,
        success: <CheckCircle size={18} color={Colors.white} />, // Might consider green if we add more colors
        warning: <AlertCircle size={18} color={Colors.maroon} />,
        error: <XCircle size={18} color={Colors.maroon} />,
    };

    return (
        <Animated.View
            style={[
                styles.toastContainer,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }
            ]}
        >
            <View style={styles.toastContent}>
                <View style={styles.iconBox}>
                    {icons[type]}
                </View>
                <Text style={styles.messageText}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 40,
        left: 20,
        right: 20,
        zIndex: 9999,
    },
    toastContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.zinc800,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        ...Shadows.card,
    },
    iconBox: {
        marginRight: Spacing.md,
    },
    messageText: {
        ...Typography.body,
        fontSize: 13,
        color: Colors.white,
        flex: 1,
    },
});

export default Toast;
