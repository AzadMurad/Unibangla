import { endpoints } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

export default function App() {
  const { accessToken, user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);

        const res = await fetch(endpoints.products, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
        });

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
      <View style={styles.container}>
        <Text>Loading products...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No products found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!user ? (
        <View style={styles.topSection}>
          <Link href="/login">
            <Text style={styles.linkText}>Login to access protected features</Text>
          </Link>
        </View>
      ) : (
        <View style={styles.topSectionRight}>
          <Pressable onPress={signOut} style={{ padding: 8 }}>
            <Text style={styles.linkText}>Logout</Text>
          </Pressable>
        </View>
      )}

      <FlatList<Product>
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link
            href={{
              pathname: "/product/[id]",
              params: { id: String(item.id) },
            }}
            asChild
>
            <Pressable style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Price: {item.price}</Text>
              <Text style={styles.detailsText}>Tap to view details</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  topSection: { marginBottom: 12 },
  topSectionRight: { marginBottom: 12, alignItems: "flex-end" },
  card: {
    padding: 15,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 8,
  },
  name: { fontSize: 18, fontWeight: "bold" },
  linkText: { color: "#0a7ea4" },
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