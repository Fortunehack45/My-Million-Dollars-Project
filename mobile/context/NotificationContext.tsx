import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useAuth } from './AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    data: any;
    timestamp: number;
    read: boolean;
}

interface NotificationContextType {
    expoPushToken: string | undefined;
    notifications: NotificationItem[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [expoPushToken, setExpoPushToken] = useState<string | undefined>(undefined);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => {
            setExpoPushToken(token);
            if (token && user) {
                // Sync token with Firebase
                updateDoc(doc(db, 'users', user.uid), {
                    expoPushTokens: arrayUnion(token),
                    lastActive: Date.now()
                }).catch(err => console.error('Error updating push token:', err));
            }
        });

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            const newNotification: NotificationItem = {
                id: notification.request.identifier,
                title: notification.request.content.title || 'Notification',
                body: notification.request.content.body || '',
                data: notification.request.content.data,
                timestamp: Date.now(),
                read: false,
            };
            setNotifications(prev => [newNotification, ...prev]);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response received:', response);
            // Handle notification tap (e.g., navigate to specific screen)
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [user]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ expoPushToken, notifications, unreadCount, markAsRead, clearAll }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#800000',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                console.warn('Project ID not found in Constants. Ensure you have a project ID in app.json/eas.json');
            }
            token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        } catch (e) {
            console.error('Error getting push token:', e);
        }
    } else {
        console.warn('Must use physical device for Push Notifications');
    }

    return token;
}
