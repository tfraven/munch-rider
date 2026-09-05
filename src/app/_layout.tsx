import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { RiderProvider, useRider } from '../context/RiderContext';
import { Toast } from '../components/Toast';
import { Colors } from '../constants/theme';

function RootLayoutContent() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = Colors[isDark ? 'dark' : 'light'];
  const { toast } = useRider();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="delivery/[id]"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
          }}
        />
        <Stack.Screen
          name="kyc/onboarding"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </>
  );
}

export default function RootLayout() {
  return (
    <RiderProvider>
      <RootLayoutContent />
    </RiderProvider>
  );
}
