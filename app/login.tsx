import { API_BASE_URL } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const { signIn, accessToken } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (accessToken) {
      router.replace("/(tabs)");
    }
  }, [accessToken]);

  const handleSubmit = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await signIn(username, password);
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>API: {API_BASE_URL}</Text>

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TextInput
        placeholder="Username"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#0a7ea4",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  error: {
    color: "crimson",
    marginBottom: 12,
    textAlign: "center",
  },
});