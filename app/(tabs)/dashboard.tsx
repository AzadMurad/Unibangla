import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type QuickAction = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  tone: string;
  textColor: string;
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
  const { t } = useLanguage();

  const quickActions: QuickAction[] = [
    {
      eyebrow: "Store",
      title: t("dashboard.action.storeTitle"),
      description: t("dashboard.action.storeDescription"),
      cta: t("dashboard.action.storeCta"),
      tone: "#efe1cb",
      textColor: palette.ink,
      onPress: () => router.push("/(tabs)"),
    },
    {
      eyebrow: "Bag",
      title: t("dashboard.action.bagTitle"),
      description: t("dashboard.action.bagDescription"),
      cta: t("dashboard.action.bagCta"),
      tone: "#e3e8f5",
      textColor: palette.ink,
      onPress: () => router.push("/(tabs)/cart"),
    },
    {
      eyebrow: "Checkout",
      title: t("dashboard.action.checkoutTitle"),
      description: t("dashboard.action.checkoutDescription"),
      cta: t("dashboard.action.checkoutCta"),
      tone: "#d7e8dd",
      textColor: palette.ink,
      onPress: () => router.push("/purchase?mode=cart" as any),
    },
    {
      eyebrow: "Account",
      title: t("dashboard.action.accountTitle"),
      description: t("dashboard.action.accountDescription"),
      cta: t("dashboard.action.accountCta"),
      tone: "#eadce7",
      textColor: palette.ink,
      onPress: () => router.push("/(tabs)/profile"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("dashboard.kicker")}</Text>
        <Text style={styles.title}>
          {t("dashboard.title", { name: user?.username || t("dashboard.account").toLowerCase() })}
        </Text>
        <Text style={styles.subtitle}>{t("dashboard.subtitle")}</Text>

        <View style={styles.heroMeta}>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>{t("dashboard.account")}</Text>
            <Text style={styles.metaValue}>{user?.is_staff ? t("dashboard.staff") : t("dashboard.customer")}</Text>
          </View>
          <View style={styles.metaBadge}>
            <Text style={styles.metaLabel}>{t("dashboard.session")}</Text>
            <Text style={styles.metaValue}>{t("dashboard.active")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>{t("dashboard.cartUnits")}</Text>
          <Text style={styles.statValue}>{totalItems}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>{t("dashboard.productsSaved")}</Text>
          <Text style={styles.statValue}>{items.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEyebrow}>{t("dashboard.currentValue")}</Text>
          <Text style={styles.statValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dashboard.quickActions")}</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={action.onPress}
              style={[styles.actionTile, { backgroundColor: action.tone }]}
            >
              <View style={styles.actionTop}>
                <Text style={[styles.actionEyebrow, { color: action.textColor }]}>
                  {action.eyebrow === "Store"
                    ? t("dashboard.action.store")
                    : action.eyebrow === "Bag"
                      ? t("dashboard.action.bag")
                      : action.eyebrow === "Checkout"
                        ? t("dashboard.action.checkout")
                        : t("dashboard.action.account")}
                </Text>
                <View style={styles.actionArrow}>
                  <Text style={styles.actionArrowText}>+</Text>
                </View>
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: action.textColor }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionDescription, { color: action.textColor }]}>
                  {action.description}
                </Text>
              </View>
              <Text style={[styles.actionLink, { color: action.textColor }]}>{action.cta}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("dashboard.accountSnapshot")}</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{t("dashboard.username")}</Text>
          <Text style={styles.infoValue}>{user?.username || t("dashboard.notAvailable")}</Text>
          <Text style={styles.infoLabel}>{t("dashboard.productsSelected")}</Text>
          <Text style={styles.infoValue}>{items.length}</Text>
          <Text style={styles.infoLabel}>{t("dashboard.monthlyUnitsSelected")}</Text>
          <Text style={styles.infoValue}>{totalItems}</Text>
        </View>
      </View>

      <Pressable onPress={signOut} style={styles.signOutButton}>
        <Text style={styles.signOutText}>{t("common.logout")}</Text>
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
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionTile: {
    width: "48%",
    minHeight: 200,
    borderRadius: 24,
    padding: 18,
    justifyContent: "space-between",
  },
  actionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  actionEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionArrowText: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },
  actionContent: {
    gap: 8,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.78,
  },
  actionLink: {
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
