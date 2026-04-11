import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";

// ✅ PREMIUM FONTS (Inter)
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

// Prevent splash auto hide
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // 🔒 Wait for fonts
  if (!loaded && !error) {
    return null;
  }

  return (
    <ToastProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ✅ ONLY TABS */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ToastProvider>
  );
}