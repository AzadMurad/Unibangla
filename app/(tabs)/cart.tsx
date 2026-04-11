import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router } from "expo-router";
import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

export default function CartScreen() {
  const { t } = useLanguage();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyKicker}>{t("cart.emptyKicker")}</Text>
          <Text style={styles.emptyTitle}>{t("cart.emptyTitle")}</Text>
          <Text style={styles.emptyText}>{t("cart.emptyText")}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View>
          <Text style={styles.kicker}>{t("cart.kicker")}</Text>
          <Text style={styles.heading}>{t("cart.heading")}</Text>
          <Text style={styles.subheading}>{t("cart.subheading", { count: totalItems })}</Text>
        </View>
        <Pressable onPress={clearCart} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>{t("cart.clearCart")}</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>{t("cart.itemNumber", { id: item.id })}</Text>
              </View>
              <Pressable onPress={() => removeItem(item.id)}>
                <Text style={styles.removeText}>{t("common.remove")}</Text>
              </Pressable>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>{t("cart.unitPrice")}</Text>
                <Text style={styles.priceValue}>{item.price}</Text>
              </View>
              <View>
                <Text style={styles.priceLabel}>{t("cart.subtotal")}</Text>
                <Text style={styles.priceValue}>{(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>{t("common.quantity")}</Text>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  style={[
                    styles.quantityButton,
                    item.quantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  disabled={item.quantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                <Text style={styles.quantityValue}>{item.quantity}</Text>
                <Pressable
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={[
                    styles.quantityButton,
                    item.quantity >= 2 && styles.quantityButtonDisabled,
                  ]}
                  disabled={item.quantity >= 2}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.limitHint}>{t("cart.limitHint")}</Text>
          </View>
        )}
      />

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{t("cart.currentTotal")}</Text>
        <Text style={styles.summaryText}>{totalPrice.toFixed(2)}</Text>
        <Pressable
          onPress={() => router.push("/purchase?mode=cart" as any)}
          style={styles.purchaseButton}
        >
          <Text style={styles.purchaseButtonText}>{t("cart.proceedToPurchase")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: palette.background,
  },
  emptyScreen: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: palette.background,
  },
  emptyCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: palette.line,
  },
  emptyKicker: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  emptyTitle: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyText: {
    color: palette.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    backgroundColor: palette.ink,
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    gap: 14,
  },
  kicker: {
    color: "#f0d5a2",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  heading: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  subheading: {
    color: "#cbd4e5",
    fontSize: 14,
    marginTop: 8,
  },
  clearButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2a3449",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 20,
    gap: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
  },
  itemName: {
    color: palette.ink,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
  },
  itemMeta: {
    color: palette.muted,
    fontSize: 13,
  },
  removeText: {
    color: "#9a3d44",
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  priceLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  priceValue: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  quantityLabel: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  quantityValue: {
    minWidth: 24,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: palette.ink,
  },
  limitHint: {
    marginTop: 12,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  summary: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
  },
  summaryLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryText: {
    color: palette.ink,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 14,
  },
  purchaseButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
