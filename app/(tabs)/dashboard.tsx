import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type QuickAction = {
  title: string;
  description: string;
  cta: string;
  onPress: () => void;
};

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
  success: "#315644",
};

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { items, totalItems, totalPrice } = useCart();

  const quickActions: QuickAction[] = [
    {
      title: "Browse products",
      description: "Step back into the collection and shop with your saved preferences.",
      cta: "Open shop",
      onPress: () => router.push("/(tabs)"),
    },
    {
      title: "Review cart",
      description: "See what is waiting in your bag before you check out.",
      cta: "Open cart",
      onPress: () => router.push("/(tabs)/cart"),
    },
    {
      title: "Checkout",
      description: "Go directly to purchase when your selection is ready.",
      cta: "Purchase now",
      onPress: () => router.push("/purchase?mode=cart" as any),
    },
    {
      title: "Profile",
      description: "Open your account and review your shopping summary.",
      cta: "Open profile",
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Dashboard</Text>
        <Text style={styles.title}>A polished overview for {user?.username || "your account"}.</Text>
        <Text style={styles.subtitle}>
          Track the essentials, move through the storefront quickly, and stay in control of your order flow.
        </Text>

        <View style={styles.heroMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>Account</Text>
            <Text style={styles.metaValue}>{user?.is_staff ? "Staff" : "Customer"}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>Session</Text>
            <Text style={styles.metaValue}>Active</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>Cart units</Text>
          <Text style={styles.statValue}>{totalItems}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>Products saved</Text>
          <Text style={styles.statValue}>{items.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>Current value</Text>
          <Text style={styles.statValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        {quickActions.map((action) => (
          <View key={action.title} style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </View>
            <Pressable onPress={action.onPress} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>{action.cta}</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account snapshot</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue}>{user?.username || "Not available"}</Text>
          <Text style={styles.infoLabel}>Products selected</Text>
          <Text style={styles.infoValue}>{items.length}</Text>
          <Text style={styles.infoLabel}>Monthly units selected</Text>
          <Text style={styles.infoValue}>{totalItems}</Text>
        </View>
      </View>

      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>Log out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: palette.background,
    gap: 18,
  },
  heroCard: {
    backgroundColor: palette.ink,
    borderRadius: 28,
    padding: 24,
  },
  kicker: {
    color: "#f0d5a2",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10,
  },
  subtitle: {
    color: "#d0d8e6",
    fontSize: 15,
    lineHeight: 22,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  metaBadge: {
    backgroundColor: "#283349",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 120,
  },
  metaLabel: {
    color: "#9eb0ca",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  statsRow: {
    gap: 12,
  },
  statCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  statEyebrow: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.ink,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  actionCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 14,
  },
  actionHeader: {
    gap: 6,
  },
  actionTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
  },
  actionDescription: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  infoLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: "#f2dfde",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  signOutText: {
    color: "#9a3d44",
    fontSize: 15,
    fontWeight: "800",
  },
});
