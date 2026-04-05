import { API_BASE_URL } from "@/constants/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setError(null);

        const res = await fetch(`${API_BASE_URL}/api/products/${id}/`);

        if (!res.ok) {
          throw new Error("Failed to load product details");
        }

        const data = await res.json();
        setProduct(data as Product);
      } catch (err: any) {
        setError(err?.message || "Could not load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading product details...</Text>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error || "Product not found"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.row}>Product ID: {product.id}</Text>
      <Text style={styles.row}>Gender: {product.gender_display}</Text>
      <Text style={styles.row}>Price: {product.price}</Text>
      <Text style={styles.row}>Stock: {product.stock}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  row: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: "crimson",
    textAlign: "center",
  },
});