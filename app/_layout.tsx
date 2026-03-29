import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/providers/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

function Root({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { accessToken } = useAuth();
  if (!accessToken && pathname !== '/login') {
    return <Redirect href="/login" />;
  }
  if (accessToken && pathname === '/login') {
    return <Redirect href="/" />;
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <Root>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </Root>
    </AuthProvider>
  );
}
