import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Pressable } from 'react-native';
import { useNotifications } from '../context/NotificationContext';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import { Bell, Trash2, CheckCircle, ChevronLeft, Inbox, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

export default function NotificationsScreen() {
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();
    const router = useRouter();

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 100)}
            exiting={FadeOutLeft}
        >
            <Pressable
                onPress={() => markAsRead(item.id)}
                style={[
                    styles.notificationItem,
                    !item.read && styles.unreadItem
                ]}
            >
                <View style={[styles.iconContainer, !item.read && styles.unreadIcon]}>
                    <Bell size={18} color={!item.read ? Colors.maroon : Colors.zinc500} />
                </View>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={[styles.title, !item.read && styles.unreadText]}>{item.title}</Text>
                        <View style={styles.timeContainer}>
                            <Clock size={10} color={Colors.zinc600} style={{ marginRight: 4 }} />
                            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
                        </View>
                    </View>
                    <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                </View>
                {!item.read && <View style={styles.unreadIndicator} />}
            </Pressable>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navbar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color={Colors.white} size={24} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Notifications</Text>
                <TouchableOpacity onPress={clearAll} style={styles.clearButton}>
                    <Trash2 color={Colors.zinc500} size={20} />
                </TouchableOpacity>
            </View>

            {notifications.length > 0 ? (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Inbox size={48} color={Colors.zinc800} />
                    </View>
                    <Text style={styles.emptyTitle}>No notifications yet</Text>
                    <Text style={styles.emptySubtitle}>We'll notify you when something important happens on the network.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    navbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        ...Typography.headingLG,
        color: Colors.white,
    },
    clearButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: Spacing.lg,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    unreadItem: {
        backgroundColor: 'rgba(128,0,0,0.05)',
        borderColor: 'rgba(128,0,0,0.1)',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    unreadIcon: {
        backgroundColor: 'rgba(128,0,0,0.1)',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        ...Typography.headingSM,
        color: Colors.zinc300,
    },
    unreadText: {
        color: Colors.white,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    time: {
        ...Typography.bodySM,
        color: Colors.zinc600,
        fontSize: 10,
    },
    body: {
        ...Typography.bodySM,
        color: Colors.zinc500,
        lineHeight: 18,
    },
    unreadIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.maroon,
        position: 'absolute',
        top: 20,
        right: 12,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xxl,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.02)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    emptyTitle: {
        ...Typography.headingLG,
        color: Colors.white,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        ...Typography.bodyLG,
        color: Colors.zinc600,
        textAlign: 'center',
    }
});
