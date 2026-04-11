import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import "react-native-reanimated";

import { PremiumPalette, PremiumRadius } from "@/constants/premium";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider, useAuth } from "@/providers/auth";
import { CartProvider } from "@/providers/cart";
import { LanguageProvider, useLanguage } from "@/providers/language";

export const unstable_settings = {
  anchor: "(tabs)",
};

function Root({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { accessToken, authReady } = useAuth();
  const { t } = useLanguage();

  const isLoginRoute = pathname === "/login";

  if (!authReady) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingOrbLarge} />
        <View style={styles.loadingOrbSmall} />
        <View style={styles.loadingCard}>
          <Text style={styles.loadingKicker}>{t("loading.kicker")}</Text>
          <Text style={styles.loadingTitle}>{t("loading.title")}</Text>
          <Text style={styles.loadingText}>{t("loading.text")}</Text>
          <ActivityIndicator size="large" color={PremiumPalette.accent} />
        </View>
      </View>
    );
  }

  if (!accessToken && !isLoginRoute) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <RootLayoutContent />
    </LanguageProvider>
  );
}

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const titles = useRootTitles();

  return (
    <AuthProvider>
      <CartProvider>
        <Root>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: PremiumPalette.background },
                headerStyle: {
                  backgroundColor: PremiumPalette.surface,
                },
                headerShadowVisible: false,
                headerTintColor: PremiumPalette.ink,
                headerTitleStyle: {
                  fontWeight: "800",
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[id]"
                options={{ title: titles.productDetails }}
              />
              <Stack.Screen name="purchase" options={{ title: titles.checkout }} />
              <Stack.Screen name="payment" options={{ title: titles.paymentMethod }} />
              <Stack.Screen
                name="modal"
                options={{
                  presentation: "modal",
                  title: titles.brandStory,
                  headerBackTitle: titles.back,
                }}
              />
              <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="dark" />
          </ThemeProvider>
        </Root>
      </CartProvider>
    </AuthProvider>
  );
}

function useRootTitles() {
  const { t } = useLanguage();

  return {
    productDetails: t("nav.productDetails"),
    checkout: t("nav.checkout"),
    paymentMethod: t("nav.paymentMethod"),
    brandStory: t("nav.brandStory"),
    back: t("nav.back"),
  };
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: PremiumPalette.background,
  },
  loadingOrbLarge: {
    position: "absolute",
    top: -70,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: PremiumPalette.accentSoft,
    opacity: 0.4,
  },
  loadingOrbSmall: {
    position: "absolute",
    bottom: -60,
    left: -20,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#d9dfec",
    opacity: 0.5,
  },
  loadingCard: {
    backgroundColor: PremiumPalette.surface,
    borderRadius: PremiumRadius.hero,
    padding: 24,
    borderWidth: 1,
    borderColor: PremiumPalette.border,
    gap: 10,
  },
  loadingKicker: {
    color: PremiumPalette.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  loadingTitle: {
    color: PremiumPalette.ink,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  loadingText: {
    color: PremiumPalette.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
});
