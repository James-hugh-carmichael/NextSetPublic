import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";

import "../global.css";
import { useUser } from "../services/auth";
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
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
  if (loading) return;

  const path = segments.join("/");

  const isLogin = path === "Login";

  if (!user && !isLogin) {
    router.replace("/Login");
  }

  if (user && isLogin) {
    router.replace("/(tabs)/Feed");
  }
  }, [user, loading, segments]);

  if (loading || user === undefined) {
  return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a" }} />
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