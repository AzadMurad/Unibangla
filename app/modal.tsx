import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { PremiumPalette, PremiumRadius } from "@/constants/premium";
import { useLanguage } from "@/providers/language";

export default function ModalScreen() {
  const { t } = useLanguage();

  return (
    <View style={styles.screen}>
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />
      <View style={styles.card}>
        <Text style={styles.kicker}>{t("modal.kicker")}</Text>
        <Text style={styles.title}>{t("modal.title")}</Text>
        <Text style={styles.body}>{t("modal.body1")}</Text>
        <Text style={styles.body}>{t("modal.body2")}</Text>

        <Link href="/" dismissTo style={styles.link}>
          <Text style={styles.linkText}>{t("modal.returnHome")}</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: PremiumPalette.background,
  },
  orbTop: {
    position: "absolute",
    top: -70,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: PremiumPalette.accentSoft,
    opacity: 0.42,
  },
  orbBottom: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#d9dfec",
    opacity: 0.55,
  },
  card: {
    backgroundColor: PremiumPalette.surface,
    borderRadius: PremiumRadius.hero,
    padding: 24,
    borderWidth: 1,
    borderColor: PremiumPalette.border,
  },
  kicker: {
    color: PremiumPalette.accent,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: PremiumPalette.ink,
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    marginBottom: 12,
  },
  body: {
    color: PremiumPalette.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  link: {
    marginTop: 12,
    backgroundColor: PremiumPalette.accent,
    borderRadius: PremiumRadius.button,
    paddingVertical: 15,
    alignItems: "center",
  },
  linkText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
