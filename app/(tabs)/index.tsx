import { endpoints } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { Redirect, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Product = {
  id: number | string;
  name: string;
  price: number;
};

const waistOptions = ["30", "32", "34", "36", "38"];

const productImages: Record<string, any> = {
  "Male Jeans": require("@/assets/images/products/male-blue.png"),
  "Male Jeans Black": require("@/assets/images/products/male-black.png"),
  "Female Jeans": require("@/assets/images/products/female-blue.png"),
  "Female Jeans Dark": require("@/assets/images/products/female-darkblue.png"),
};

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

export default function App() {
  const { accessToken, user, signOut } = useAuth();
  const { addItem, getItemQuantity } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWaists, setSelectedWaists] = useState<Record<string, string>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      try {
        setError(null);
        const res = await fetch(endpoints.products);

        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected response format");
        }

        setProducts(data as Product[]);
      } catch (err: any) {
        setError(err?.message || "Could not load products");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [accessToken]);

  if (!accessToken) {
    return <Redirect href="/login" />;
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>Loading collection...</Text>
        <Text style={styles.centerSubtitle}>Preparing the latest product lineup for you.</Text>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>We could not load the products</Text>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>No products found</Text>
        <Text style={styles.centerSubtitle}>The collection will appear here once items are available.</Text>
      </View>
    );
  }

  return (
    <FlatList<Product>
      data={products}
      keyExtractor={(item) => item.id.toString()}
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View style={styles.headerSection}>
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>Curated Collection</Text>
            <Text style={styles.heroTitle}>Denim essentials with a cleaner, premium presentation.</Text>
            <Text style={styles.heroSubtitle}>
              Choose your fit, set quantity, and move directly to cart or checkout.
            </Text>
          </View>

          <View style={styles.topRow}>
            <View>
              <Text style={styles.welcomeText}>Welcome, {user?.username || "Guest"}</Text>
              <Text style={styles.helperText}>Every product allows up to 2 units per month.</Text>
            </View>
            <Pressable onPress={signOut} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const itemKey = item.id.toString();
        const selectedWaist = selectedWaists[itemKey];
        const cartQuantity = getItemQuantity(Number(item.id));
        const remainingAllowance = Math.max(0, 2 - cartQuantity);
        const selectedQuantity = Math.min(
          selectedQuantities[itemKey] ?? 1,
          Math.max(1, remainingAllowance || 1)
        );

        const updateSelectedQuantity = (nextQuantity: number) => {
          setSelectedQuantities((currentQuantities) => ({
            ...currentQuantities,
            [itemKey]: Math.max(1, Math.min(2, nextQuantity)),
          }));
        };

        const handleAddToCart = () => {
          if (!selectedWaist || remainingAllowance === 0) {
            return;
          }

          const result = addItem({
            id: Number(item.id),
            name: item.name,
            price: Number(item.price),
            quantity: selectedQuantity,
          });

          const message =
            result.added === selectedQuantity
              ? `${selectedQuantity} ${item.name} added to cart.`
              : result.added > 0
                ? `${result.added} ${item.name} added to cart. Monthly limit reached.`
                : `${item.name} is already at the 2-unit monthly cart limit.`;

          Alert.alert("Cart", message);
        };

        return (
          <View style={styles.card}>
            <View style={styles.imageShell}>
              <Image
                source={
                  productImages[item.name] ||
                  require("@/assets/images/products/male-blue.png")
                }
                style={styles.image}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>BDT {item.price}</Text>

            <View style={styles.inlineMeta}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaLabel}>Item</Text>
                <Text style={styles.metaValue}>#{item.id}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaLabel}>In cart</Text>
                <Text style={styles.metaValue}>{cartQuantity}</Text>
              </View>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.controlLabel}>Quantity</Text>
              <View style={styles.quantityControls}>
                <Pressable
                  onPress={() => updateSelectedQuantity(selectedQuantity - 1)}
                  style={[
                    styles.quantityButton,
                    selectedQuantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  disabled={selectedQuantity <= 1}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </Pressable>
                <Text style={styles.quantityValue}>{selectedQuantity}</Text>
                <Pressable
                  onPress={() => updateSelectedQuantity(selectedQuantity + 1)}
                  style={[
                    styles.quantityButton,
                    (selectedQuantity >= 2 || selectedQuantity >= remainingAllowance) &&
                      styles.quantityButtonDisabled,
                  ]}
                  disabled={selectedQuantity >= 2 || selectedQuantity >= remainingAllowance}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.quantityHint}>
                Maximum 2 units of this product per month.
              </Text>
            </View>

            <Text style={styles.controlLabel}>Waist</Text>
            <View style={styles.waistOptions}>
              {waistOptions.map((waist) => {
                const isSelected = selectedWaist === waist;

                return (
                  <Pressable
                    key={waist}
                    onPress={() =>
                      setSelectedWaists((currentWaists) => ({
                        ...currentWaists,
                        [itemKey]: waist,
                      }))
                    }
                    style={[
                      styles.waistChip,
                      isSelected && styles.waistChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.waistChipText,
                        isSelected && styles.waistChipTextSelected,
                      ]}
                    >
                      {waist}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[
                  styles.secondaryButton,
                  (!selectedWaist || remainingAllowance === 0) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddToCart}
                disabled={!selectedWaist || remainingAllowance === 0}
              >
                <Text style={styles.secondaryButtonText}>
                  {!selectedWaist
                    ? "Select waist"
                    : remainingAllowance === 0
                      ? "Limit reached"
                      : "Add to Cart"}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryButton,
                  !selectedWaist && styles.disabledButton,
                ]}
                onPress={() =>
                  router.push(
                    `/purchase?mode=single&id=${item.id}&quantity=${selectedQuantity}&waist=${selectedWaist}` as any
                  )
                }
                disabled={!selectedWaist}
              >
                <Text style={styles.primaryButtonText}>
                  {selectedWaist ? "Buy Now" : "Select waist"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[
                styles.detailsButton,
                !selectedWaist && styles.disabledButton,
              ]}
              onPress={() => router.push(`/product/${item.id}?waist=${selectedWaist}` as any)}
              disabled={!selectedWaist}
            >
              <Text style={styles.detailsButtonText}>
                {selectedWaist ? "Open Details" : "Select waist to continue"}
              </Text>
            </Pressable>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 34,
    gap: 16,
  },
  headerSection: {
    marginBottom: 6,
  },
  heroCard: {
    backgroundColor: palette.ink,
    borderRadius: 28,
    padding: 24,
    marginBottom: 16,
  },
  kicker: {
    color: "#f0d5a2",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: "#d1d9e6",
    fontSize: 15,
    lineHeight: 22,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  welcomeText: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "800",
  },
  helperText: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    color: palette.ink,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.background,
  },
  centerTitle: {
    color: palette.ink,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  centerSubtitle: {
    color: palette.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  error: {
    color: "#9a3d44",
    textAlign: "center",
    fontSize: 14,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.line,
    marginBottom: 16,
  },
  imageShell: {
    backgroundColor: "#f5efe4",
    borderRadius: 22,
    padding: 10,
    marginBottom: 14,
  },
  image: {
    width: "100%",
    height: 280,
  },
  name: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  price: {
    color: palette.accent,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  inlineMeta: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  metaBadge: {
    flex: 1,
    backgroundColor: "#f1e7d6",
    borderRadius: 16,
    padding: 12,
  },
  metaLabel: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  quantitySection: {
    alignItems: "center",
    marginBottom: 16,
  },
  controlLabel: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    opacity: 0.45,
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 26,
  },
  quantityValue: {
    minWidth: 32,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: palette.ink,
  },
  quantityHint: {
    marginTop: 8,
    fontSize: 12,
    color: palette.muted,
    textAlign: "center",
  },
  waistOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  waistChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: "#fff",
  },
  waistChipSelected: {
    backgroundColor: palette.ink,
    borderColor: palette.ink,
  },
  waistChipText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "700",
  },
  waistChipTextSelected: {
    color: "#fff",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flex: 1,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: palette.ink,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    flex: 1,
  },
  secondaryButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  detailsButton: {
    backgroundColor: "#efe5d5",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  detailsButtonText: {
    color: palette.ink,
    fontWeight: "800",
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
