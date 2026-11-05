import { useFonts } from "expo-font";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text, View } from "react-native";
import "react-native-reanimated";

import "../global.css";
import { useUser } from "../services/auth";
import { useMusician } from "../services/musicians";
import { useColorScheme } from "@/components/useColorScheme";
import { useRouter, useSegments } from "expo-router";

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
  const {
    musician,
    loading: musicianLoading,
    error: musicianError,
    loadedUserId,
  } = useMusician(user?.id);
  const router = useRouter();
  const segments = useSegments();
  const profileLoading = Boolean(user) && loadedUserId !== user?.id;

  useEffect(() => {
  if (loading || musicianLoading || profileLoading || musicianError) return;

  const path = segments.join("/");

  const isLogin = path === "Login";
  const isOnboarding = path === "Onboarding";
  const isProfileSetup = path === "ProfileSetup";

  if (!user && !isLogin) {
    router.replace("/Login");
  }

  if (user && !musician?.onboarding_complete && !isOnboarding && !isProfileSetup) {
    router.replace("/Onboarding");
  }

  if (user && musician?.onboarding_complete && (isLogin || isOnboarding)) {
    router.replace("/(tabs)/Feed");
  }
  }, [user, loading, musician, musicianLoading, musicianError, profileLoading, segments]);

  if (loading || musicianLoading || profileLoading || user === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />
    );
  }

  if (musicianError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#0a0a0a" }}>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          Unable to load your profile
        </Text>
        <Text style={{ color: "#9ca3af" }}>{musicianError}</Text>
      </View>
    );
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
        <Stack.Screen name="BandDetail"/>
      </Stack>
    </ThemeProvider>
  );
}