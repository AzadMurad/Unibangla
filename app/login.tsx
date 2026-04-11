import { API_BASE_URL } from "@/constants/api";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/providers/auth";
import { useLanguage } from "@/providers/language";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  surfaceAlt: "#efe5d5",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  accentDark: "#8b6432",
  error: "#b94b53",
  border: "#dccfb9",
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await signIn(username, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e?.message || t("login.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <View style={styles.container}>
        <View style={styles.switcherWrap}>
          <LanguageSwitcher compact />
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>{t("app.name")}</Text>
          <Text style={styles.title}>{t("login.title")}</Text>
          <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
          <View style={styles.apiPill}>
            <Text style={styles.apiLabel}>{t("login.connectedApi")}</Text>
            <Text style={styles.apiValue}>{API_BASE_URL}</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{t("login.welcomeBack")}</Text>
          <Text style={styles.formText}>{t("login.formText")}</Text>

          {!!error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            placeholder={t("login.username")}
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            style={styles.input}
          />

          <TextInput
            placeholder={t("login.password")}
            placeholderTextColor={palette.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t("login.enterStore")}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  backgroundGlowTop: {
    position: "absolute",
    top: -80,
    right: -40,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#e7d3ae",
    opacity: 0.45,
  },
  backgroundGlowBottom: {
    position: "absolute",
    bottom: -90,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#d9dfec",
    opacity: 0.5,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    gap: 18,
  },
  switcherWrap: {
    alignItems: "flex-end",
  },
  heroCard: {
    backgroundColor: palette.ink,
    borderRadius: 28,
    padding: 24,
  },
  kicker: {
    color: "#f3d9a6",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    color: "#d2d8e4",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  apiPill: {
    backgroundColor: "#2a3449",
    borderRadius: 16,
    padding: 14,
  },
  apiLabel: {
    color: "#b5c0d7",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  apiValue: {
    color: "#fff",
    fontSize: 13,
  },
  formCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
  },
  formTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },
  formText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  errorCard: {
    backgroundColor: "#fae5e7",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: palette.error,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    color: palette.ink,
    fontSize: 15,
  },
  button: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
