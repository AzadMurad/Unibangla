import { PremiumPalette, PremiumRadius } from "@/constants/premium";
import { Language } from "@/constants/translations";
import { useLanguage } from "@/providers/language";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { language, setLanguage, t } = useLanguage();

  const options: Language[] = ["en", "bn"];

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {!compact && <Text style={styles.label}>{t("language.switcherTitle")}</Text>}
      <View style={styles.pill}>
        {options.map((option) => {
          const selected = option === language;

          return (
            <Pressable
              key={option}
              onPress={() => setLanguage(option)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {option === "en" ? t("language.english") : t("language.bengali")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  containerCompact: {
    gap: 0,
  },
  label: {
    color: PremiumPalette.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  pill: {
    flexDirection: "row",
    backgroundColor: PremiumPalette.surface,
    borderWidth: 1,
    borderColor: PremiumPalette.border,
    borderRadius: PremiumRadius.pill,
    padding: 4,
    alignSelf: "flex-start",
  },
  option: {
    borderRadius: PremiumRadius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  optionSelected: {
    backgroundColor: PremiumPalette.accent,
  },
  optionText: {
    color: PremiumPalette.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#fff",
  },
});
