import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import BackButton from "@/components/BackButton";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

const settingsMenuItems = [
  {
    key: "contact-us",
    title: "Contact Us",
    icon: "person-circle-outline" as const,
    route: "/(tabs)/settings/contact-us",
  },
];

export default function SettingsMenuMobile() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="bg-white dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-gray-700"
      >
        <View className="flex-row items-center">
          <BackButton onPress={() => router.back()} />
          <Text className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            Settings
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 bg-white dark:bg-background-dark">
        {settingsMenuItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            onPress={() => router.push(item.route as Href)}
            className="flex-row items-center justify-between px-5 py-4"
          >
            <View className="flex-row items-center">
              <Ionicons
                name={item.icon}
                size={22}
                color="#6B7280"
                style={{ marginRight: 12 }}
              />
              <Text className="text-base text-gray-900 dark:text-gray-100">
                {item.title}
              </Text>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
