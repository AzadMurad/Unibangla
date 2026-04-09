import { endpoints } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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

const productImages: Record<string, any> = {
  "Male Jeans": require("@/assets/images/products/male-blue.png"),
  "Male Jeans Black": require("@/assets/images/products/male-black.png"),
  "Female Jeans": require("@/assets/images/products/female-blue.png"),
  "Female Jeans Dark": require("@/assets/images/products/female-darkblue.png"),
};

export default function App() {
  const { accessToken, user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading products...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No products found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={styles.topSection}>
          <Text style={styles.linkText}>Login to access protected features</Text>
        </View>
      ) : (
        <View style={styles.topSectionRight}>
          <Pressable onPress={signOut} style={styles.logoutButton}>
            <Text style={styles.linkText}>Logout</Text>
          </Pressable>
        </View>
      )}

      <FlatList<Product>
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/product/${item.id}` as any)}
          >
            <Image
              source={
                productImages[item.name] ||
                require("@/assets/images/products/male-blue.png")
              }
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.price}>Price: {item.price}</Text>
            <Text style={styles.detailsText}>Tap to view details</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    marginBottom: 12,
  },
  topSectionRight: {
    marginBottom: 12,
    alignItems: "flex-end",
  },
  logoutButton: {
    padding: 8,
  },
  card: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    marginBottom: 16,
    borderRadius: 12,
  },
  image: {
    width: "100%",
    height: 320,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fff"
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    marginBottom: 4,
  },
  linkText: {
    color: "#0a7ea4",
    fontSize: 14,
  },
  detailsText: {
    marginTop: 8,
    color: "#666",
    fontSize: 12,
  },
  error: {
    color: "crimson",
    textAlign: "center",
  },
});