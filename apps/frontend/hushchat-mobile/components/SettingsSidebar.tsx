import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href } from "expo-router";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { MENU_ITEMS } from "@/constants/settingsNavigation";

export default function SettingsSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
      <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Settings
        </AppText>
      </View>

      <ScrollView>
        {MENU_ITEMS.map(({ key, title, icon, route }) => {
          const isActive = pathname === route;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => router.push(route)}
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
