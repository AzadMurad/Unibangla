import { endpoints } from "@/constants/api";
import { useAuth } from "@/providers/auth";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

type Product = {
  id: number | string;
  name: string;
  price: number;
};

export default function App() {
  const { accessToken, user, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(endpoints.products, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Products:", data);
        setProducts(data as Product[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [accessToken]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Connecting to Django...</Text>
        <ActivityIndicator size="large" />
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
        <View style={{ marginBottom: 12 }}>
          <Link href="/login">
            <Text style={{ color: "#0a7ea4" }}>Login to access protected features</Text>
          </Link>
        </View>
      ) : (
        <View style={{ marginBottom: 12, alignItems: "flex-end" }}>
          <Pressable onPress={signOut} style={{ padding: 8 }}>
            <Text style={{ color: "#0a7ea4" }}>Logout</Text>
          </Pressable>
        </View>
      )}
      <FlatList<Product>
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Price: {item.price}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: { padding: 15, backgroundColor: "#eee", marginBottom: 10, borderRadius: 8 },
  name: { fontSize: 18, fontWeight: "bold" },
});
