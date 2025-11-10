import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname, Href } from "expo-router";
import BackButton from "@/components/BackButton";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { MENU_ITEMS } from "@/constants/settingsNavigation";
import { PLATFORM } from "@/constants/platformConstants";

export default function SettingsMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`flex-1 ${
        PLATFORM.IS_WEB
          ? "w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800"
          : "bg-gray-50 dark:bg-gray-900"
      }`}
    >
      {/* Header */}
      <View
        style={PLATFORM.IS_WEB ? {} : { paddingTop: insets.top + 12 }}
        className={`px-${PLATFORM.IS_WEB ? "6" : "4"} py-${
          PLATFORM.IS_WEB ? "4" : "3"
        } border-b border-gray-200 dark:border-gray-${PLATFORM.IS_WEB ? "800" : "700"} ${
          PLATFORM.IS_WEB ? "" : "bg-white dark:bg-background-dark"
        }`}
      >
        {PLATFORM.IS_WEB ? (
          <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Settings
          </AppText>
        ) : (
          <View className="flex-row items-center">
            <BackButton onPress={() => router.back()} />
            <Text className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Settings</Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <ScrollView className={PLATFORM.IS_WEB ? "" : "flex-1 bg-white dark:bg-background-dark"}>
        {MENU_ITEMS.map((item) => {
          const isActive = PLATFORM.IS_WEB && pathname === item.route;

          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => router.push(item.route as Href)}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              className={`px-${PLATFORM.IS_WEB ? "6" : "5"} py-4 flex-row items-center ${
                PLATFORM.IS_WEB && isActive ? "bg-primary-light/10 dark:bg-secondary-dark" : ""
              } ${PLATFORM.IS_WEB ? "" : "justify-between"}`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={item.icon}
                  size={PLATFORM.IS_WEB ? 20 : 22}
                  color={PLATFORM.IS_WEB ? "grey" : "#6B7280"}
                  style={PLATFORM.IS_WEB ? {} : { marginRight: 12 }}
                />
                {PLATFORM.IS_WEB ? (
                  <AppText className="ml-3 text-base text-text-primary-light dark:text-white">
                    {item.title}
                  </AppText>
                ) : (
                  <Text className="text-base text-gray-900 dark:text-gray-100">{item.title}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
