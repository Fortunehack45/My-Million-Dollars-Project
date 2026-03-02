import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate
} from 'react-native-reanimated';
import { Colors } from '../theme';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    variant?: 'rect' | 'circle' | 'text';
    style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    variant = 'rect',
    style
}) => {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const shimmerStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            shimmer.value,
            [0, 1],
            [-150, 450]
        );
        return {
            transform: [{ translateX }],
        };
    });

    const getVariantStyle = () => {
        switch (variant) {
            case 'circle':
                return { borderRadius: 999 };
            case 'text':
                return { borderRadius: 4, height: 12 };
            default:
                return { borderRadius: 12 };
        }
    };

    return (
        <View style={[
            styles.container,
            { width, height },
            getVariantStyle(),
            style
        ]}>
            <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
                <View style={styles.shimmer} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
    },
    shimmer: {
        width: '50%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        transform: [{ skewX: '-20deg' }],
    }
});

export default Skeleton;
