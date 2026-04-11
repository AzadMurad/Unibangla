import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLanguage } from "@/providers/language";

const palette = {
  background: "#f3efe7",
  surface: "#fffaf2",
  ink: "#1a2233",
  muted: "#6c7284",
  accent: "#b38345",
  line: "#e3d7c3",
};

export default function ExploreScreen() {
  const { t } = useLanguage();
  const sections = [
    {
      title: t("explore.section1Title"),
      text: t("explore.section1Text"),
    },
    {
      title: t("explore.section2Title"),
      text: t("explore.section2Text"),
    },
    {
      title: t("explore.section3Title"),
      text: t("explore.section3Text"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("explore.kicker")}</Text>
        <Text style={styles.title}>{t("explore.title")}</Text>
        <Text style={styles.subtitle}>{t("explore.subtitle")}</Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.cardText}>{section.text}</Text>
        </View>
      ))}

      <View style={styles.featureCard}>
        <Text style={styles.featureKicker}>{t("explore.nextMove")}</Text>
        <Text style={styles.featureTitle}>{t("explore.featureTitle")}</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(tabs)")}>
          <Text style={styles.buttonText}>{t("explore.openCollection")}</Text>
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
