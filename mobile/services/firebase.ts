
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
    apiKey: "AIzaSyDmi5prKatt_Z-d2-YCMmw344KbzYZv15E",
    authDomain: "argus-protocol.firebaseapp.com",
    projectId: "argus-protocol",
    storageBucket: "argus-protocol.firebasestorage.app",
    messagingSenderId: "803748553158",
    appId: "1:803748553158:web:c1547b3ddfa148eb4b92c7",
    databaseURL: "https://argus-protocol-default-rtdb.firebaseio.com",
    measurementId: "G-6EVXT8DJMK"
};

const app = initializeApp(firebaseConfig);

// Use native AsyncStorage persistence on mobile, default on web
export const auth = Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });

// Firestore with offline persistence (mobile-compatible)
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache()
});

export const rtdb = getDatabase(app, "https://argus-protocol-default-rtdb.firebaseio.com");

export default app;
