import { endpoints } from "@/constants/api";
import { PremiumPalette, PremiumRadius } from "@/constants/premium";
import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
  Platform,
} from "react-native";

type Product = {
  id: number;
  name: string;
  gender_display: string;
  price: string | number;
};

type PaymentMethod = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  brand: string;
  logoText: string;
  logoBackground: string;
  logoTextColor: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    id: "cod",
    title: "Cash On Delivery",
    subtitle: "Pay in cash when the order arrives.",
    accent: "#efe1cb",
    brand: "COD",
    logoText: "৳",
    logoBackground: "#d7b07c",
    logoTextColor: "#ffffff",
  },
  {
    id: "baksh",
    title: "Baksh",
    subtitle: "Complete the payment through your Baksh wallet.",
    accent: "#eadce7",
    brand: "Baksh",
    logoText: "B",
    logoBackground: "#b1458f",
    logoTextColor: "#ffffff",
  },
  {
    id: "nagad",
    title: "Nagad",
    subtitle: "Use your Nagad account for a direct mobile payment.",
    accent: "#f1dfd1",
    brand: "Nagad",
    logoText: "N",
    logoBackground: "#f26a21",
    logoTextColor: "#ffffff",
  },
  {
    id: "upay",
    title: "Upay",
    subtitle: "Choose Upay for a simple digital transfer.",
    accent: "#ddeadd",
    brand: "Upay",
    logoText: "U",
    logoBackground: "#7a297f",
    logoTextColor: "#ffffff",
  },
  {
    id: "rocket",
    title: "Rocket",
    subtitle: "Pay securely with your Rocket wallet.",
    accent: "#e3e8f5",
    brand: "Rocket",
    logoText: "R",
    logoBackground: "#8a245c",
    logoTextColor: "#ffffff",
  },
];

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PaymentScreen() {
  const { t } = useLanguage();
  const { mode, id, quantity, waist } = useLocalSearchParams<{
    mode?: string;
    id?: string;
    quantity?: string;
    waist?: string;
  }>();
  const { accessToken } = useAuth();
  const { items, totalItems, totalPrice, removeItems } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(mode === "single");
  const [submitting, setSubmitting] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>("cod");

  useEffect(() => {
    if (mode !== "single" || !id) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const res = await fetch(`${endpoints.products}${id}/`);
        if (!res.ok) {
          throw new Error(t("payment.loadingTitle"));
        }

        const data = await res.json();
        setProduct(data as Product);
      } catch (error: any) {
        Alert.alert(t("payment.kicker"), error?.message || t("purchase.productUnavailable"));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, mode, t]);

  const singleQuantity = Math.max(1, Number(quantity || 1));
  const singleTotal = product ? Number(product.price) * singleQuantity : 0;
  const isCartMode = mode === "cart";

  const cartItemsLabel = useMemo(() => {
    return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
  }, [items]);

  const getPaymentMethodLabel = (methodId: string) => {
    switch (methodId) {
      case "cod":
        return t("payment.method.cod");
      case "baksh":
        return t("payment.method.baksh");
      case "nagad":
        return t("payment.method.nagad");
      case "upay":
        return t("payment.method.upay");
      case "rocket":
        return t("payment.method.rocket");
      default:
        return t("payment.notSelected");
    }
  };

  const getPaymentMethodSubtitle = (methodId: string) => {
    switch (methodId) {
      case "cod":
        return t("payment.method.codSubtitle");
      case "baksh":
        return t("payment.method.bakshSubtitle");
      case "nagad":
        return t("payment.method.nagadSubtitle");
      case "upay":
        return t("payment.method.upaySubtitle");
      case "rocket":
        return t("payment.method.rocketSubtitle");
      default:
        return "";
    }
  };

  const activeMethod = paymentMethods.find((method) => method.id === selectedMethod);

  const submitPurchase = async (productId: number, purchaseQuantity: number) => {
    const res = await fetch(endpoints.ordersPurchase, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: purchaseQuantity,
        payment_method: selectedMethod,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data?.error || data?.detail || "Purchase failed");
    }

    return data;
  };

  const handleConfirmPurchase = async () => {
    if (!accessToken) {
      setPurchaseError(t("login.failed"));
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setPurchaseError(null);

    try {
      if (isCartMode) {
        if (items.length === 0) {
          throw new Error("Your cart is empty.");
        }

        const purchasedIds: number[] = [];

        for (const item of items) {
          await submitPurchase(item.id, item.quantity);
          purchasedIds.push(item.id);
        }

        removeItems(purchasedIds);
        Alert.alert(
          t("payment.completeTitle"),
          t("payment.completeCart", {
            method: activeMethod ? getPaymentMethodLabel(activeMethod.id) : t("payment.notSelected"),
          }),
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/cart"),
            },
          ]
        );
        return;
      }

      if (!product) {
        throw new Error("Product details are unavailable.");
      }

      await submitPurchase(product.id, singleQuantity);
      Alert.alert(
        t("payment.completeTitle"),
        t("payment.completeSingle", {
          method: activeMethod ? getPaymentMethodLabel(activeMethod.id) : t("payment.notSelected"),
        }),
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error: any) {
      setPurchaseError(error?.message || t("payment.purchaseError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>{t("payment.loadingTitle")}</Text>
        <Text style={styles.centerText}>{t("payment.loadingText")}</Text>
        <ActivityIndicator size="large" color={PremiumPalette.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("payment.kicker")}</Text>
        <Text style={styles.title}>{t("payment.title")}</Text>
        <Text style={styles.subtitle}>{t("payment.subtitle")}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("payment.methods")}</Text>
        <View style={styles.methodsGrid}>
          {paymentMethods.map((method) => {
            const isSelected = method.id === selectedMethod;

            return (
              <Pressable
                key={method.id}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedMethod(method.id);
                }}
                style={({ pressed }) => [
                  styles.methodCard,
                  { backgroundColor: method.accent },
                  isSelected && styles.methodCardSelected,
                  pressed && styles.methodCardPressed,
                ]}
              >
                <View style={styles.methodCardTop}>
                  <View
                    style={[
                      styles.methodLogo,
                      { backgroundColor: method.logoBackground },
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodLogoText,
                        { color: method.logoTextColor },
                      ]}
                    >
                      {method.logoText}
                    </Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodBadgeText}>{method.brand}</Text>
                  </View>
                </View>
                <View style={styles.methodBody}>
                  <Text style={styles.methodTitle}>
                    {getPaymentMethodLabel(method.id)}
                  </Text>
                  <Text style={styles.methodSubtitle}>{getPaymentMethodSubtitle(method.id)}</Text>
                </View>
                <View style={styles.methodFooter}>
                  <Text style={styles.methodSelectText}>
                    {isSelected ? t("payment.selected") : t("payment.tapToSelect")}
                  </Text>
                  <View
                    style={[
                      styles.methodIndicator,
                      isSelected && styles.methodIndicatorSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.methodIndicatorText,
                        isSelected && styles.methodIndicatorTextSelected,
                      ]}
                    >
                      {isSelected ? "OK" : "+"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("payment.orderSummary")}</Text>
        <Text style={styles.rowLabel}>{t("payment.method")}</Text>
        <Text style={styles.rowValue}>
          {activeMethod ? getPaymentMethodLabel(activeMethod.id) : t("payment.notSelected")}
        </Text>

        {isCartMode ? (
          <>
            <Text style={styles.rowLabel}>{t("purchase.items")}</Text>
            <Text style={styles.rowValue}>{totalItems}</Text>
            <Text style={styles.rowLabel}>{t("purchase.products")}</Text>
            <Text style={styles.rowValue}>{cartItemsLabel || "No items selected"}</Text>
            <Text style={styles.rowLabel}>{t("purchase.total")}</Text>
            <Text style={styles.totalValue}>{totalPrice.toFixed(2)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.rowLabel}>{t("common.product")}</Text>
            <Text style={styles.rowValue}>{product?.name || "Unavailable"}</Text>
            <Text style={styles.rowLabel}>{t("product.selectedWaist")}</Text>
            <Text style={styles.rowValue}>{waist || t("payment.notSelected")}</Text>
            <Text style={styles.rowLabel}>{t("common.quantity")}</Text>
            <Text style={styles.rowValue}>{singleQuantity}</Text>
            <Text style={styles.rowLabel}>{t("purchase.total")}</Text>
            <Text style={styles.totalValue}>{singleTotal.toFixed(2)}</Text>
          </>
        )}
      </View>

      {!!purchaseError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{t("payment.purchaseError")}</Text>
          <Text style={styles.errorText}>{purchaseError}</Text>
        </View>
      )}

      <Pressable
        onPress={handleConfirmPurchase}
        style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
        disabled={submitting}
      >
        <Text style={styles.confirmButtonText}>
          {submitting ? t("payment.processingPurchase") : t("payment.confirmPurchase")}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: PremiumPalette.background,
    gap: 18,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: PremiumPalette.background,
  },
  centerTitle: {
    color: PremiumPalette.ink,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  centerText: {
    color: PremiumPalette.muted,
    fontSize: 14,
    marginBottom: 14,
  },
  heroCard: {
    backgroundColor: PremiumPalette.ink,
    borderRadius: PremiumRadius.hero,
    padding: 24,
  },
  kicker: {
    color: PremiumPalette.accentSoft,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
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
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: PremiumPalette.ink,
    fontSize: 20,
    fontWeight: "800",
  },
  methodsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  methodCard: {
    width: "48%",
    minHeight: 210,
    borderRadius: PremiumRadius.card,
    padding: 18,
    borderWidth: 1,
    borderColor: "transparent",
    justifyContent: "space-between",
  },
  methodCardSelected: {
    borderColor: PremiumPalette.ink,
    minHeight: 236,
    transform: [{ translateY: -4 }],
    shadowColor: "#1a2233",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  methodCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  methodCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  methodLogoText: {
    fontSize: 22,
    fontWeight: "800",
  },
  methodBadge: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: PremiumRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  methodBadgeText: {
    color: PremiumPalette.ink,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  methodTitle: {
    color: PremiumPalette.ink,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  methodSubtitle: {
    color: PremiumPalette.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  methodBody: {
    gap: 8,
  },
  methodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  methodSelectText: {
    color: PremiumPalette.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  methodIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  methodIndicatorSelected: {
    backgroundColor: PremiumPalette.ink,
  },
  methodIndicatorText: {
    color: PremiumPalette.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  methodIndicatorTextSelected: {
    color: "#fff",
  },
  card: {
    backgroundColor: PremiumPalette.surface,
    borderRadius: PremiumRadius.card,
    padding: 20,
    borderWidth: 1,
    borderColor: PremiumPalette.border,
  },
  cardTitle: {
    color: PremiumPalette.ink,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  rowLabel: {
    color: PremiumPalette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  rowValue: {
    color: PremiumPalette.ink,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  totalValue: {
    color: PremiumPalette.accent,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 2,
  },
  errorCard: {
    backgroundColor: PremiumPalette.dangerSoft,
    borderRadius: PremiumRadius.card,
    padding: 18,
  },
  errorTitle: {
    color: PremiumPalette.dangerText,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: PremiumPalette.dangerText,
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: PremiumPalette.accent,
    borderRadius: PremiumRadius.button,
    paddingVertical: 17,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
