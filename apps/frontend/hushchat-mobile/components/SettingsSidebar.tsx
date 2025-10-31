import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href } from "expo-router";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface MenuItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

interface SettingsSidebarProps {
  menuItems: MenuItem[];
  title?: string;
}

export default function SettingsSidebar({ menuItems, title = "Settings" }: SettingsSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </AppText>
      </View>

      <ScrollView>
        {menuItems.map(({ key, title, icon, route }) => {
          const isActive = pathname === route;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => router.push(route as Href)}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              className={`px-6 py-4 flex-row items-center ${
                isActive ? "bg-primary-light/10 dark:bg-secondary-dark" : ""
              }`}
            >
              <Ionicons name={icon} size={20} color="grey" />
              <AppText className="ml-3 text-base text-text-primary-light dark:text-white">
                {title}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
