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

const sections = [
  {
    title: "Editorial mood",
    text: "A calmer, richer interface language turns browsing into something that feels more curated than technical.",
  },
  {
    title: "Premium materials",
    text: "Warm neutrals, deep ink surfaces, and brass accents create a look that feels elevated without becoming loud.",
  },
  {
    title: "Faster decision-making",
    text: "Users can move from discovery to fit selection to purchase with fewer jumps and more context on every screen.",
  },
];

export default function ExploreScreen() {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>Explore</Text>
        <Text style={styles.title}>A more editorial view of the shopping experience.</Text>
        <Text style={styles.subtitle}>
          This space highlights the design direction behind the storefront and gives users another polished entry point into the catalog.
        </Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardText}>{section.text}</Text>
        </View>
      ))}

      <View style={styles.featureCard}>
        <Text style={styles.featureKicker}>Next move</Text>
        <Text style={styles.featureTitle}>Go back to the collection and keep shopping.</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.buttonText}>Open Collection</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: palette.background,
    gap: 16,
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
    marginBottom: 8,
  },
  cardText: {
    color: palette.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  featureCard: {
    backgroundColor: "#ece4d4",
    borderRadius: 24,
    padding: 20,
  },
  featureKicker: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  featureTitle: {
    color: palette.ink,
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    marginBottom: 14,
  },
  button: {
    backgroundColor: palette.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },
});
