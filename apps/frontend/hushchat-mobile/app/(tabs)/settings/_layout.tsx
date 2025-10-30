import React from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href, Slot } from "expo-router";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { Stack } from "expo-router";
import { AppText } from "@/components/AppText";

interface SettingsMenuItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const settingsMenuItems: SettingsMenuItem[] = [
  {
    key: "contact-us",
    title: "Contact Us",
    icon: "mail-outline",
    route: "/settings/contact-us",
  },
  // Add more menu items here
];

export default function SettingsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="flex-1 flex-row bg-background-light dark:bg-background-dark">
      <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
        <View className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <View className="flex-row items-center">
            <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Settings
            </AppText>
          </View>
        </View>

        <ScrollView className="flex-1">
          {settingsMenuItems.map((item) => {
            const isActive = pathname === item.route;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => router.push(item.route as Href)}
                activeOpacity={DEFAULT_ACTIVE_OPACITY}
                className={`px-6 py-4 flex-row items-center ${
                  isActive ? "bg-primary-light/10 dark:bg-secondary-dark" : ""
                }`}
              >
                <AppText
                  className={"text-base ml-3 dark:text-white light:text-black"}
                >
                  {item.title}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}
