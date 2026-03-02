import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48 - 12) / 2;

interface StatCardProps {
    label: string;
    value: string;
    subValue?: string;
    icon: any;
}

export const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    subValue,
    icon: Icon
}) => {
    return (
        <View style={styles.statCard}>
            <View style={styles.statIconBox}>
                <Icon size={14} color={Colors.zinc500} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
            {subValue ? <Text style={styles.statSub} numberOfLines={1}>{subValue}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    statCard: {
        width: CARD_W,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.zinc800 + '80',
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        gap: 6,
        ...Shadows.card,
    },
    statIconBox: {
        width: 32,
        height: 32,
        backgroundColor: Colors.zinc900,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.zinc800,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statLabel: {
        ...Typography.label,
        color: Colors.zinc600,
        fontSize: 8
    },
    statValue: {
        fontFamily: 'monospace',
        fontSize: 14,
        fontWeight: '900',
        color: Colors.white
    },
    statSub: {
        fontSize: 9,
        color: Colors.zinc600,
        fontWeight: '500'
    },
});

export default StatCard;
