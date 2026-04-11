import { endpoints } from "@/constants/api";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type OrderHistoryItem = {
  id: number;
  product_name: string;
  gender: string;
  quantity: number;
  purchase_date: string;
  is_returned: boolean;
};

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

const RETURN_WINDOW_DAYS = 21;

function getReturnDeadline(purchaseDate: string) {
  const deadline = new Date(purchaseDate);
  deadline.setDate(deadline.getDate() + RETURN_WINDOW_DAYS);
  return deadline;
}

function formatDate(dateValue: string | Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(typeof dateValue === "string" ? new Date(dateValue) : dateValue);
}

function canStillReturn(order: OrderHistoryItem) {
  if (order.is_returned) {
    return false;
  }

  return new Date() <= getReturnDeadline(order.purchase_date);
}

export default function ProfileScreen() {
  const { user, signOut, accessToken } = useAuth();
  const { totalItems, items, totalPrice } = useCart();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [returningOrderId, setReturningOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    if (!accessToken) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    try {
      setOrdersError(null);
      setLoadingOrders(true);

      const response = await fetch(endpoints.ordersHistory, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || data?.detail || t("profile.loadingOrdersError"));
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? (data as OrderHistoryItem[]) : []);
    } catch (error: any) {
      setOrdersError(error?.message || t("profile.loadingOrdersError"));
    } finally {
      setLoadingOrders(false);
    }
  }, [accessToken, t]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const handleReturnOrder = async (order: OrderHistoryItem) => {
    if (!accessToken || returningOrderId) {
      return;
    }

    const eligible = canStillReturn(order);
    if (!eligible) {
      Alert.alert(t("profile.returnUnavailable"), t("profile.returnUnavailableText"));
      return;
    }

    setReturningOrderId(order.id);

    try {
      const response = await fetch(`${endpoints.ordersReturn}${order.id}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || "Unable to return this order.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id
            ? { ...currentOrder, is_returned: true }
            : currentOrder
        )
      );

      Alert.alert(t("profile.returnSuccess"), t("profile.returnSuccessText"));
    } catch (error: any) {
      Alert.alert(t("profile.returnFailed"), error?.message || t("profile.returnFailed"));
    } finally {
      setReturningOrderId(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.slice(0, 1).toUpperCase() || "U"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.role}>
          {user?.is_staff ? t("profile.staffAccount") : t("profile.customerAccount")}
        </Text>
        <Text style={styles.heroText}>{t("profile.heroText")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.details")}</Text>
        <View style={styles.card}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t("dashboard.username")}</Text>
            <Text style={styles.value}>{user?.username || t("dashboard.notAvailable")}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t("profile.userId")}</Text>
            <Text style={styles.value}>{user?.id ?? t("dashboard.notAvailable")}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t("profile.accountType")}</Text>
            <Text style={styles.value}>{user?.is_staff ? t("dashboard.staff") : t("dashboard.customer")}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>{t("profile.status")}</Text>
            <Text style={styles.value}>{t("profile.signedIn")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.shoppingSummary")}</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{items.length}</Text>
            <Text style={styles.summaryLabel}>{t("profile.productsInCart")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalItems}</Text>
            <Text style={styles.summaryLabel}>{t("profile.unitsSelected")}</Text>
          </View>
        </View>
        <View style={styles.summaryWideCard}>
          <Text style={styles.label}>{t("profile.currentCartValue")}</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.recentPurchases")}</Text>
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>{t("profile.returnWindowTitle")}</Text>
          <Text style={styles.noticeText}>{t("profile.returnWindowText")}</Text>
        </View>

        {loadingOrders ? (
          <View style={styles.ordersStateCard}>
            <ActivityIndicator color={palette.accent} />
            <Text style={styles.ordersStateText}>{t("profile.loadingOrders")}</Text>
          </View>
        ) : ordersError ? (
          <View style={styles.ordersStateCard}>
            <Text style={styles.ordersErrorText}>{ordersError}</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.ordersStateCard}>
            <Text style={styles.ordersStateText}>{t("profile.noPurchases")}</Text>
          </View>
        ) : (
          orders.map((order) => {
            const eligible = canStillReturn(order);
            const deadline = getReturnDeadline(order.purchase_date);
            const isReturning = returningOrderId === order.id;

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderTitleBlock}>
                    <Text style={styles.orderName}>{order.product_name}</Text>
                    <Text style={styles.orderMeta}>
                      {t("profile.orderMeta", {
                        gender: order.gender,
                        quantity: order.quantity,
                        suffix: order.quantity > 1 ? "s" : "",
                      })}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.orderStatusBadge,
                      order.is_returned
                        ? styles.orderStatusReturned
                        : eligible
                          ? styles.orderStatusEligible
                          : styles.orderStatusExpired,
                    ]}
                  >
                    <Text style={styles.orderStatusText}>
                      {order.is_returned
                        ? t("profile.returned")
                        : eligible
                          ? t("profile.returnEligible")
                          : t("profile.returnExpired")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderDate}>
                  {t("profile.purchasedOn", { date: formatDate(order.purchase_date) })}
                </Text>
                <Text style={styles.orderDate}>
                  {t("profile.returnUntil", { date: formatDate(deadline) })}
                </Text>

                <Pressable
                  style={[
                    styles.returnButton,
                    (!eligible || isReturning) && styles.returnButtonDisabled,
                  ]}
                  onPress={() => handleReturnOrder(order)}
                  disabled={!eligible || isReturning}
                >
                  <Text style={styles.returnButtonText}>
                    {order.is_returned
                      ? t("profile.alreadyReturned")
                      : isReturning
                        ? t("profile.processingReturn")
                        : eligible
                          ? t("profile.returnProduct")
                          : t("profile.returnWindowClosed")}
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.languageSettings")}</Text>
        <View style={styles.card}>
          <Text style={styles.noticeText}>{t("profile.chooseLanguage")}</Text>
          <LanguageSwitcher />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("profile.shortcuts")}</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/(tabs)/dashboard")}>
          <Text style={styles.primaryButtonText}>{t("profile.openDashboard")}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/(tabs)/cart")}>
          <Text style={styles.secondaryButtonText}>{t("profile.viewCart")}</Text>
        </Pressable>
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
  noticeCard: {
    backgroundColor: "#ece4d4",
    borderRadius: 20,
    padding: 16,
  },
  noticeTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
  },
  noticeText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  ordersStateCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    alignItems: "center",
    gap: 10,
  },
  ordersStateText: {
    color: palette.muted,
    fontSize: 14,
  },
  ordersErrorText: {
    color: "#9a3d44",
    fontSize: 14,
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    gap: 10,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  orderTitleBlock: {
    flex: 1,
  },
  orderName: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  orderMeta: {
    color: palette.muted,
    fontSize: 13,
  },
  orderStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderStatusEligible: {
    backgroundColor: "#ddeadd",
  },
  orderStatusExpired: {
    backgroundColor: "#f0e5d9",
  },
  orderStatusReturned: {
    backgroundColor: "#e4e7f4",
  },
  orderStatusText: {
    color: palette.ink,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  orderDate: {
    color: palette.muted,
    fontSize: 13,
  },
  returnButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  returnButtonDisabled: {
    opacity: 0.5,
  },
  returnButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
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
