
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../theme';
import { Cpu, Wallet, CheckSquare, Image, MoreHorizontal } from 'lucide-react-native';

import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

function TabBarIcon({ icon: Icon, color, focused }: { icon: any; color: string; focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.2 : 1, { damping: 15 }) }],
  }));

  return (
    <Animated.View style={[animatedStyle, { alignItems: 'center', justifyContent: 'center' }]}>
      <Icon size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      {focused && (
        <View style={{ position: 'absolute', bottom: -12, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.maroon }} />
      )}
    </Animated.View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.maroon,
        tabBarInactiveTintColor: Colors.zinc600,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 32 : 24,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          backgroundColor: Platform.OS === 'ios' ? 'rgba(24, 24, 27, 0.4)' : Colors.zinc900,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
          paddingBottom: 0,
          paddingTop: 0,
          overflow: 'hidden', // to bound the BlurView mask within border radius
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          ) : null,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Cpu} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Wallet} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={CheckSquare} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="nft"
        options={{
          title: 'NFT',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={Image} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => <TabBarIcon icon={MoreHorizontal} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
