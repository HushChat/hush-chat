import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { INavigationItem } from "@/types/navigation/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";

interface WebNavigationInterfaceProps {
  navigationItems: INavigationItem[];
}

const WebNavigationInterface = ({ navigationItems }: WebNavigationInterfaceProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { totalUnreadCount } = useConversationNotificationsContext();

  const SideBarContent = () => (
    <View className="bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full flex-col items-center py-3 w-[80px]">
      <View className="flex-1 w-full items-center space-y-2">
        {navigationItems.map((item) => {
          const isFocused = pathname.startsWith(item.route as string);

          const onPress = () => {
            router.push(item.route);
          };

          return (
            <View key={item.name} className="group relative w-full items-center">
              <View className=" absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
                <View
                  className={`w-1 rounded-r-full ${
                    isFocused
                      ? "h-10 opacity-100 bg-primary-light dark:bg-primary-dark"
                      : "h-3 group-hover:h-7 group-hover:bg-primary-light group-hover:dark:bg-primary-dark bg-gray-400"
                  }`}
                />
              </View>

              <TouchableOpacity
                onPress={onPress}
                activeOpacity={DEFAULT_ACTIVE_OPACITY}
                className="group relative"
              >
                <View
                  className={classNames("w-12 h-12 items-center justify-center", {
                    "bg-primary-light dark:bg-primary-dark rounded-2xl": isFocused,
                    "bg-gray-100 dark:bg-background-dark rounded-3xl hover:rounded-2xl hover:bg-secondary-light hover:dark:bg-secondary-dark":
                      !isFocused,
                  })}
                >
                  <AppText
                    className={`${
                      isFocused
                        ? "text-text-primary-dark"
                        : "text-gray-500 group-hover:text-primary-light group-hover:dark:text-text-primary-dark"
                    }`}
                  >
                    <Ionicons
                      name={
                        isFocused
                          ? (item.icon as keyof typeof Ionicons.glyphMap)
                          : (`${item.icon}-outline` as keyof typeof Ionicons.glyphMap)
                      }
                      size={24}
                    />
                  </AppText>
                  {item.name === "conversations" && totalUnreadCount > 0 && (
                    <View className="absolute -top-1 -right-1 bg-green-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                      <AppText className="text-white text-[10px] font-bold leading-tight">
                        {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                      </AppText>
                    </View>
                  )}
                </View>

                <View className="absolute left-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                  <View className="bg-gray-800 dark:bg-black px-3 py-2 rounded-lg">
                    <AppText className="text-text-primary-dark text-sm font-medium whitespace-nowrap">
                      {item.title}
                    </AppText>

                    <View className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1">
                      <View className="w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-gray-800 dark:border-r-black" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View className="mt-auto">
        <View className="w-8 h-0.5 bg-gray-300 dark:bg-slate-700 mx-auto mb-2 rounded-full" />
        <TouchableOpacity
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-2xl items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700"
          onPress={() => router.push("/(tabs)/settings")}
        >
          <Ionicons name="settings-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="absolute top-0 left-0 bottom-0 z-50">
      <SideBarContent />
    </View>
  );
};

export default WebNavigationInterface;
