import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
"import './styles/index.css';"
import "../global.css"
import { useUser } from "../services/auth"


import { useColorScheme } from '@/components/useColorScheme';


export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useUser();
  const router = require("expo-router").useRouter();
  const segments = require("expo-router").useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)" || segments[0] === "Login";

    if (!user && !inAuthGroup) {
      router.replace("/Login");
    }

    if (user && inAuthGroup) {
      router.replace("/(tabs)/Feed");
    }
  }, [user, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="ProfileSetup" options={{ headerShown: false }} />
        <Stack.Screen name="BandDetail" options={{ title: 'Band' }} />
      </Stack>
    </ThemeProvider>
  );
}