import { endpoints } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
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

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

export default function PurchaseScreen() {
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

  useEffect(() => {
    if (mode !== "single" || !id) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        const res = await fetch(`${endpoints.products}${id}/`);
        if (!res.ok) {
          throw new Error("Failed to load purchase details");
        }

        const data = await res.json();
        setProduct(data as Product);
      } catch (error: any) {
        Alert.alert("Purchase", error?.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, mode]);

  const singleQuantity = Math.max(1, Number(quantity || 1));
  const singleTotal = product ? Number(product.price) * singleQuantity : 0;
  const isCartMode = mode === "cart";

  const cartItemsLabel = useMemo(() => {
    return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
  }, [items]);

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
      setPurchaseError("Please log in again to complete your purchase.");
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
        Alert.alert("Purchase complete", "Your cart order has been placed.", [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/cart"),
          },
        ]);
        return;
      }

      if (!product) {
        throw new Error("Product details are unavailable.");
      }

      await submitPurchase(product.id, singleQuantity);
      Alert.alert("Purchase complete", "Your order has been placed.", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      setPurchaseError(error?.message || "Unable to complete purchase.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>Preparing checkout...</Text>
        <Text style={styles.centerText}>Loading your purchase summary.</Text>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Checkout</Text>
        <Text style={styles.title}>Review the order before confirming payment.</Text>
        <Text style={styles.subtitle}>
          Clean, simple, and focused on the final purchase decision.
        </Text>
      </View>

      {isCartMode ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cart purchase</Text>
          <Text style={styles.rowLabel}>Items</Text>
          <Text style={styles.rowValue}>{totalItems}</Text>
          <Text style={styles.rowLabel}>Products</Text>
          <Text style={styles.rowValue}>{cartItemsLabel || "No items selected"}</Text>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice.toFixed(2)}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Single product purchase</Text>
          <Text style={styles.rowLabel}>Product</Text>
          <Text style={styles.rowValue}>{product?.name || "Unavailable"}</Text>
          <Text style={styles.rowLabel}>Product ID</Text>
          <Text style={styles.rowValue}>{product?.id || id}</Text>
          <Text style={styles.rowLabel}>Selected waist</Text>
          <Text style={styles.rowValue}>{waist || "Not selected"}</Text>
          <Text style={styles.rowLabel}>Gender</Text>
          <Text style={styles.rowValue}>{product?.gender_display || "-"}</Text>
          <Text style={styles.rowLabel}>Quantity</Text>
          <Text style={styles.rowValue}>{singleQuantity}</Text>
          <Text style={styles.rowLabel}>Total</Text>
          <Text style={styles.totalValue}>{singleTotal.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>Purchase note</Text>
        <Text style={styles.noticeText}>
          Confirming here will submit the order to the backend purchase API. The app allows up to 2 units per product each month, not 2 units total across all products.
        </Text>
      </View>

      {!!purchaseError && (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Purchase error</Text>
          <Text style={styles.errorText}>{purchaseError}</Text>
        </View>
      )}

      <Pressable
        onPress={handleConfirmPurchase}
        style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
        disabled={submitting}
      >
        <Text style={styles.confirmButtonText}>
          {submitting ? "Processing Purchase..." : "Confirm Purchase"}
        </Text>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: palette.background,
  },
  centerTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  centerText: {
    color: palette.muted,
    fontSize: 14,
    marginBottom: 14,
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
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  rowLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  rowValue: {
    color: palette.ink,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  totalValue: {
    color: palette.accent,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 2,
  },
  noticeCard: {
    backgroundColor: "#ece4d4",
    borderRadius: 24,
    padding: 18,
  },
  noticeTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  noticeText: {
    color: "#4f5566",
    fontSize: 14,
    lineHeight: 21,
  },
  errorCard: {
    backgroundColor: "#f2dfde",
    borderRadius: 24,
    padding: 18,
  },
  errorTitle: {
    color: "#9a3d44",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  errorText: {
    color: "#9a3d44",
    fontSize: 14,
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
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
