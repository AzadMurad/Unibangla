import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { PremiumPalette } from "@/constants/premium";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/providers/auth";
import { useCart } from "@/providers/cart";
import { useLanguage } from "@/providers/language";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  useAuth();
  const { totalItems } = useCart();
  const { t } = useLanguage();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: PremiumPalette.accent,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        sceneStyle: {
          backgroundColor: PremiumPalette.background,
        },
        tabBarStyle: {
          backgroundColor: PremiumPalette.surface,
          borderTopColor: PremiumPalette.border,
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 2,
        },
        tabBarBadgeStyle: {
          backgroundColor: PremiumPalette.accent,
          color: "#fff",
          fontWeight: "800",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.dashboard"),
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.crop.circle.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t("tabs.explore"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("tabs.cart"),
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="cart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={26} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
