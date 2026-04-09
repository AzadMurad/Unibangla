import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { totalItems, items, totalPrice } = useCart();

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.slice(0, 1).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.role}>{user?.is_staff ? "Staff Account" : "Customer Account"}</Text>
        <Text style={styles.heroText}>
          A refined account space for your details, shopping activity, and shortcuts.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile details</Text>
        <View style={styles.card}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user?.username || "Not available"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{user?.id ?? "Not available"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Account type</Text>
            <Text style={styles.value}>{user?.is_staff ? "Staff" : "Customer"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>Signed in</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shopping summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{items.length}</Text>
            <Text style={styles.summaryLabel}>Products in cart</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalItems}</Text>
            <Text style={styles.summaryLabel}>Units selected</Text>
          </View>
        </View>
        <View style={styles.summaryWideCard}>
          <Text style={styles.label}>Current cart value</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shortcuts</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/dashboard")}>
          <Text style={styles.primaryButtonText}>Open Dashboard</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/(tabs)/cart")}>
          <Text style={styles.secondaryButtonText}>View Cart</Text>
        </Pressable>
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
    alignItems: "center",
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  name: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 4,
  },
  role: {
    color: "#d8dfeb",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  heroText: {
    color: "#c5cfde",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 14,
  },
  infoBlock: {
    gap: 4,
  },
  label: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  value: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  summaryNumber: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  summaryWideCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  totalValue: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "800",
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
