import { endpoints } from "@/constants/api";
import { PremiumPalette, PremiumRadius } from "@/constants/premium";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Product = {
  id: number;
  name: string;
  gender_display: string;
  price: string | number;
};

export default function PurchaseScreen() {
  const { t } = useLanguage();
  const { mode, id, quantity, waist } = useLocalSearchParams<{
    mode?: string;
    id?: string;
    quantity?: string;
    waist?: string;
  }>();
  const { items, totalItems, totalPrice } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(mode === "single");

  useEffect(() => {
    if (mode !== "single" || !id) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const res = await fetch(`${endpoints.products}${id}/`);
        if (!res.ok) {
          throw new Error(t("purchase.loadingText"));
        }

        const data = await res.json();
        setProduct(data as Product);
      } catch (error: any) {
        Alert.alert(t("purchase.kicker"), error?.message || t("purchase.productUnavailable"));
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

  const handleContinueToPayment = () => {
    if (isCartMode) {
      router.push("/payment?mode=cart" as any);
      return;
    }

      if (!product) {
      Alert.alert(t("nav.checkout"), t("purchase.productUnavailable"));
      return;
    }

    router.push(
      `/payment?mode=single&id=${product.id}&quantity=${singleQuantity}&waist=${waist || ""}` as any
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>{t("purchase.loadingTitle")}</Text>
        <Text style={styles.centerText}>{t("purchase.loadingText")}</Text>
        <ActivityIndicator size="large" color={PremiumPalette.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("purchase.kicker")}</Text>
        <Text style={styles.title}>{t("purchase.title")}</Text>
        <Text style={styles.subtitle}>{t("purchase.subtitle")}</Text>
      </View>

      {isCartMode ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("purchase.cartPurchase")}</Text>
          <Text style={styles.rowLabel}>{t("purchase.items")}</Text>
          <Text style={styles.rowValue}>{totalItems}</Text>
          <Text style={styles.rowLabel}>{t("purchase.products")}</Text>
          <Text style={styles.rowValue}>{cartItemsLabel || "No items selected"}</Text>
          <Text style={styles.rowLabel}>{t("purchase.total")}</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("purchase.singlePurchase")}</Text>
          <Text style={styles.rowLabel}>{t("common.product")}</Text>
          <Text style={styles.rowValue}>{product?.name || "Unavailable"}</Text>
          <Text style={styles.rowLabel}>{t("product.productId")}</Text>
          <Text style={styles.rowValue}>{product?.id || id}</Text>
          <Text style={styles.rowLabel}>{t("product.selectedWaist")}</Text>
          <Text style={styles.rowValue}>{waist || t("payment.notSelected")}</Text>
          <Text style={styles.rowLabel}>{t("product.gender")}</Text>
          <Text style={styles.rowValue}>{product?.gender_display || "-"}</Text>
          <Text style={styles.rowLabel}>{t("common.quantity")}</Text>
          <Text style={styles.rowValue}>{singleQuantity}</Text>
          <Text style={styles.rowLabel}>{t("purchase.total")}</Text>
          <Text style={styles.totalValue}>{singleTotal.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>{t("purchase.nextStep")}</Text>
        <Text style={styles.noticeText}>{t("purchase.nextStepText")}</Text>
      </View>

      <Pressable onPress={handleContinueToPayment} style={styles.confirmButton}>
        <Text style={styles.confirmButtonText}>{t("purchase.continueToPayment")}</Text>
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
  noticeCard: {
    backgroundColor: PremiumPalette.backgroundAlt,
    borderRadius: PremiumRadius.card,
    padding: 18,
  },
  noticeTitle: {
    color: PremiumPalette.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  noticeText: {
    color: "#4f5566",
    fontSize: 14,
    lineHeight: 21,
  },
  confirmButton: {
    backgroundColor: PremiumPalette.accent,
    borderRadius: PremiumRadius.button,
    paddingVertical: 17,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
