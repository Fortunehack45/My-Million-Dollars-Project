
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { user, firebaseUser, loading } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function checkOnboarding() {
      const stored = await AsyncStorage.getItem('@argus_has_onboarded');
      setHasOnboarded(stored === 'true');
    }
    checkOnboarding();
  }, []);

  useEffect(() => {
    if (loading || hasOnboarded === null) return;
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(tabs)';

    if (!hasOnboarded) {
      if (segments[0] !== 'onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    if (!firebaseUser) {
      // Not logged in → send to login
      if (segments[0] !== 'login' && segments[0] !== 'onboarding') {
        router.replace('/login');
      }
    } else if (firebaseUser && !user) {
      // Logged in but no profile yet → send to setup
      if (segments[0] !== 'setup') {
        router.replace('/setup');
      }
    } else if (firebaseUser && user) {
      // Fully authenticated → send to tabs
      if (!inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [firebaseUser, user, loading, hasOnboarded, segments]);

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="setup" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NotificationProvider>
          <RootNavigation />
        </NotificationProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
