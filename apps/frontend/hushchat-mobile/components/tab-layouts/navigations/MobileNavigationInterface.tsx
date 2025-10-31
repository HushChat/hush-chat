import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { PLATFORM } from "@/constants/platformConstants";
import { INavigationItem } from "@/types/navigation/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
interface MobileNavigationInterfaceProps extends BottomTabBarProps {
  navigationItems: INavigationItem[];
}

const MobileNavigationInterface = ({
  state,
  descriptors,
  navigation,
  navigationItems,
}: MobileNavigationInterfaceProps) => {
  const insets = useSafeAreaInsets();

  const TabBarContent = () => (
    <View
      className="flex-row bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-gray-800 justify-center gap-2"
      style={{ paddingBottom: insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const navigationItem = navigationItems.find((item) => item.name === route.name);

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : navigationItem?.title || route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const iconName = navigationItem?.icon
          ? isFocused
            ? (navigationItem.icon as keyof typeof Ionicons.glyphMap)
            : (`${navigationItem.icon}-outline` as keyof typeof Ionicons.glyphMap)
          : ("help-circle-outline" as keyof typeof Ionicons.glyphMap);

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="items-center px-4 py-2"
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <View
              className={`p-2 rounded-2xl ${
                isFocused ? "bg-primary-light dark:bg-primary-dark" : "bg-transparent"
              }`}
            >
              <Ionicons name={iconName} size={24} color={isFocused ? "#ffffff" : "#6B7280"} />
            </View>

            <Text
              className={`text-xs mt-1 font-medium ${
                isFocused
                  ? "text-text-primary-light dark:text-text-primary-dark"
                  : "text-gray-500 dark:text-text-primary-dark"
              }`}
            >
              {typeof label === "string" ? label : "Tab"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (PLATFORM.IS_IOS) {
    return (
      <BlurView intensity={100} tint="light" className="absolute bottom-0 left-0 right-0">
        <TabBarContent />
      </BlurView>
    );
  }

  return <TabBarContent />;
};

export default MobileNavigationInterface;
