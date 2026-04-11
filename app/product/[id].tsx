import { API_BASE_URL } from "@/constants/api";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Product = {
  id: number;
  name: string;
  gender: string;
  gender_display: string;
  price: string | number;
  stock: number;
};

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

export default function ProductDetailScreen() {
  const { t } = useLanguage();
  const { id, waist } = useLocalSearchParams<{ id: string; waist?: string }>();
  const monthlyLimit = 2;
  const { addItem, getItemQuantity, updateQuantity } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setError(null);
        const res = await fetch(`${API_BASE_URL}/api/products/${id}/`);

        if (!res.ok) {
          throw new Error(t("product.loading"));
        }

        const data = await res.json();
        setProduct(data as Product);
        setQuantity((currentQuantity) => {
          const stock = Math.max(0, Number((data as Product).stock) || 0);
          const maxQuantity = Math.min(stock, monthlyLimit);
          return maxQuantity > 0 ? Math.min(currentQuantity, maxQuantity) : 0;
        });
      } catch (err: any) {
        setError(err?.message || t("product.notFoundText"));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id, t]);

  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const remainingAllowance = Math.max(0, monthlyLimit - cartQuantity);
  const maxQuantity = product
    ? Math.min(Math.max(0, product.stock || 0), remainingAllowance)
    : 0;
  const isOutOfStock = product ? product.stock <= 0 : false;
  const limitReachedInCart = !!product && !isOutOfStock && remainingAllowance === 0;
  const isAddDisabled = !product || isOutOfStock || limitReachedInCart || quantity <= 0;
  const canDecrease = quantity > 1 || cartQuantity > 0;

  useEffect(() => {
    if (!product) {
      return;
    }

    if (isOutOfStock) {
      setQuantity(0);
      return;
    }

    if (limitReachedInCart) {
      setQuantity(Math.max(1, cartQuantity));
      return;
    }

    setQuantity((currentQuantity) => {
      if (currentQuantity < 1) {
        return 1;
      }
      return Math.min(currentQuantity, maxQuantity);
    });
  }, [cartQuantity, isOutOfStock, limitReachedInCart, maxQuantity, product]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>{t("product.loading")}</Text>
        <ActivityIndicator size="large" color={palette.accent} />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centerTitle}>{t("product.notFound")}</Text>
        <Text style={styles.error}>{error || t("product.notFoundText")}</Text>
      </View>
    );
  }

  const decreaseQuantity = () => {
    if (product && cartQuantity > 0 && limitReachedInCart) {
      const nextCartQuantity = cartQuantity - 1;
      updateQuantity(product.id, nextCartQuantity);
      setQuantity(Math.max(1, nextCartQuantity));
      setCartMessage(
        nextCartQuantity > 0
          ? t("product.reducedQuantity", { name: product.name, count: nextCartQuantity })
          : t("product.removedFromCart", { name: product.name })
      );
      return;
    }

    setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1));
  };

  const increaseQuantity = () => {
    setQuantity((currentQuantity) => Math.min(maxQuantity, currentQuantity + 1));
  };

  const handleAddToCart = () => {
    if (!product || isAddDisabled) {
      return;
    }

    const result = addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity,
    });

    const message =
      result.added > 0
        ? t("product.addedToCart", { count: result.added, name: product.name })
        : t("product.limitMessage", { name: product.name });

    setCartMessage(message);
    Alert.alert(t("product.addedTitle"), message);
  };

  const handleBuyNow = () => {
    if (!product || isAddDisabled) {
      return;
    }

    router.push(
      `/purchase?mode=single&id=${product.id}&quantity=${quantity}&waist=${waist || ""}` as any
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("product.kicker")}</Text>
        <Text style={styles.heroTitle}>{product.name}</Text>
        <Text style={styles.heroSubtitle}>{t("product.heroSubtitle")}</Text>
      </View>

      <View style={styles.imageShell}>
        <Image
          source={
            productImages[product.name] ||
            require("@/assets/images/products/male-blue.png")
          }
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.label}>{t("product.productId")}</Text>
        <Text style={styles.value}>{product.id}</Text>
        <Text style={styles.label}>{t("product.selectedWaist")}</Text>
        <Text style={styles.value}>{waist || t("payment.notSelected")}</Text>
        <Text style={styles.label}>{t("product.gender")}</Text>
        <Text style={styles.value}>{product.gender_display}</Text>
        <Text style={styles.label}>{t("product.price")}</Text>
        <Text style={styles.value}>BDT {product.price}</Text>
        <Text style={styles.label}>{t("product.availability")}</Text>
        <Text style={styles.value}>{product.stock > 0 ? t("product.available") : t("product.outOfStock")}</Text>
      </View>

      <View style={styles.quantitySection}>
        <Text style={styles.sectionTitle}>{t("common.quantity")}</Text>
        <View style={styles.quantityControls}>
          <Pressable
            onPress={decreaseQuantity}
            style={[
              styles.quantityButton,
              !canDecrease && styles.quantityButtonDisabled,
            ]}
            disabled={!canDecrease}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </Pressable>

          <Text style={styles.quantityValue}>{quantity}</Text>

          <Pressable
            onPress={increaseQuantity}
            style={[
              styles.quantityButton,
              (quantity >= maxQuantity || isAddDisabled) &&
                styles.quantityButtonDisabled,
            ]}
            disabled={quantity >= maxQuantity || isAddDisabled}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.quantityHint}>{t("product.quantityHint")}</Text>
        {cartQuantity > 0 && (
          <Text style={styles.quantityHint}>
            {t("product.alreadyInCart", {
              count: cartQuantity,
              suffix: cartQuantity > 1 ? "s" : "",
            })}
          </Text>
        )}
      </View>

      <View style={styles.waistBadge}>
        <Text style={styles.waistBadgeLabel}>{t("product.selectedWaistCaps")}</Text>
        <Text style={styles.waistBadgeValue}>{waist || t("payment.notSelected")}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={handleAddToCart}
          style={[styles.secondaryButton, isAddDisabled && styles.disabledButton]}
          disabled={isAddDisabled}
        >
          <Text style={styles.secondaryButtonText}>
            {isOutOfStock
              ? t("product.outOfStock")
              : limitReachedInCart
                ? t("product.monthlyLimitReached")
                : t("home.addToCart")}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleBuyNow}
          style={[styles.primaryButton, isAddDisabled && styles.disabledButton]}
          disabled={isAddDisabled}
        >
          <Text style={styles.primaryButtonText}>{t("home.buyNow")}</Text>
        </Pressable>
      </View>

      {!!cartMessage && <Text style={styles.cartMessage}>{cartMessage}</Text>}
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
    padding: 20,
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
  error: {
    color: "#9a3d44",
    textAlign: "center",
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
    textTransform: "uppercase",
    letterSpacing: 1.2,
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
    color: "#d0d8e6",
    fontSize: 15,
    lineHeight: 22,
  },
  imageShell: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
  },
  image: {
    width: "100%",
    height: 340,
  },
  detailsCard: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  label: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  value: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  quantitySection: {
    alignItems: "center",
    backgroundColor: palette.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.line,
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    minWidth: 36,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink,
  },
  quantityHint: {
    marginTop: 10,
    fontSize: 13,
    color: palette.muted,
    textAlign: "center",
    maxWidth: 280,
  },
  waistBadge: {
    alignSelf: "center",
    minWidth: 200,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "#ece4d4",
    alignItems: "center",
  },
  waistBadgeLabel: {
    fontSize: 11,
    color: palette.muted,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  waistBadgeValue: {
    fontSize: 26,
    color: palette.ink,
    fontWeight: "800",
  },
  actionButtons: {
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: palette.ink,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: palette.accent,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.5,
  },
  cartMessage: {
    textAlign: "center",
    color: palette.accent,
    fontSize: 14,
    fontWeight: "700",
  },
});
