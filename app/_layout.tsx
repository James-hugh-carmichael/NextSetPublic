import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import "../global.css";
import { useUser } from "../services/auth";
import { useColorScheme } from "@/components/useColorScheme";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "../lib/supabase";

/**
 * Root layout component for the application.
 *
 * Provides the main navigation structure and application-level providers.
 *
 * Handles:
 * - Initial route configuration
 * - Authentication-based navigation
 * - Theme management
 * - Global stack navigation setup
 *
 * Delegates authentication and onboarding checks to the navigation wrapper.
 */

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  const [checkingProfile, setCheckingProfile] = useState(false);
  const hasCheckedOnce = useRef(false);

  useEffect(() => {
    const run = async () => {
      if (loading) return;

      const segmentsArr = segments as string[];
      const isLogin = segmentsArr.includes("Login");
      const isMusicianSetup = segmentsArr.includes("Musiciansetup");

      if (!user) {
        hasCheckedOnce.current = false;
        if (!isLogin) router.replace("/Login");
        return;
      }

      if (!hasCheckedOnce.current) setCheckingProfile(true);

      const { data: profile } = await supabase
        .from("Musicians")
        .select("onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      hasCheckedOnce.current = true;
      setCheckingProfile(false);

      if (!profile) {
        await supabase
          .from("Musicians")
          .upsert(
            { id: user.id, onboarding_complete: false },
            { onConflict: "id" }
          );

        if (!isMusicianSetup) router.replace("/Musiciansetup");
        return;
      }

      if (!profile.onboarding_complete) {
        if (!isMusicianSetup) router.replace("/Musiciansetup");
        return;
      }

      if (isLogin) {
      router.replace("/(tabs)/Feed");
    }
    };

    run();
  }, [user, loading, segments]);

  if (loading || checkingProfile || user === undefined) {
    return <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="BandDetail" />
        <Stack.Screen name="Musiciansetup" />
      </Stack>
    </ThemeProvider>
  );
}