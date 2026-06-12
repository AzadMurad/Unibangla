import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
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

export default function CartScreen() {
  const { t } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingBottom: tabBarHeight + 16 }]}
    >
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

      <View style={styles.itemsPanel}>
        <Text style={styles.itemsPanelTitle}>{t("purchase.products")}</Text>
        <View style={styles.itemsPanelList}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>{t("cart.itemNumber", { id: item.id })}</Text>
                  {!!item.waist && (
                    <Text style={styles.itemWaist}>
                      {t("product.selectedWaist")}: {item.waist}
                    </Text>
                  )}
                </View>
                <Pressable onPress={() => removeItem(item.id)}>
                  <Text style={styles.removeText}>{t("common.remove")}</Text>
                </Pressable>
              </View>

              <View style={styles.priceRow}>
                <View style={styles.infoBox}>
                  <Text style={styles.priceLabel}>{t("cart.unitPrice")}</Text>
                  <Text style={styles.priceValue}>{item.price}</Text>
                </View>
                <View style={styles.infoBox}>
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
          ))}
        </View>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  contentContainer: {
    padding: 20,
    gap: 14,
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
    paddingVertical: 18,
    paddingHorizontal: 22,
    marginBottom: 14,
    gap: 10,
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
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
  },
  subheading: {
    color: "#cbd4e5",
    fontSize: 13,
    marginTop: 6,
  },
  clearButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2a3449",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  itemsPanel: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
  },
  itemsPanelTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  itemsPanelList: {
    gap: 14,
  },
  card: {
    backgroundColor: "#f8f2e8",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
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
  itemWaist: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  removeText: {
    color: "#9a3d44",
    fontWeight: "700",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 14,
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
    marginTop: 10,
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
    marginTop: 18,
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  summary: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 14,
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
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  purchaseButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
