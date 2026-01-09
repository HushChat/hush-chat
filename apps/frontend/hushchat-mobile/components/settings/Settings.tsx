import React, { useState, useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { AppText } from "@/components/AppText";
import SidebarMenu, { SidebarMenuItem } from "@/components/SidebarMenu";
import { getSettingsMenuItems } from "@/configs/settingsMenu";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { useRouter, usePathname, Href } from "expo-router";

interface SettingsLayoutWrapperProps {
  children: React.ReactNode;
}

export default function SettingsWrapper({ children }: SettingsLayoutWrapperProps) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const workspaceRole = user?.workspaceRole;

  const { workspaces, isLoadingWorkspaces } = useUserWorkspacesQuery();

  useEffect(() => {
    const loadMenuItems = () => {
      const workspaceCount = workspaces ? workspaces.length : 0;
      const items = getSettingsMenuItems({ workspaceCount }, workspaceRole);
      setMenuItems(items);
    };

    loadMenuItems();
  }, [workspaces, workspaceRole]);

  const selectedKey = useMemo(() => {
    const matchedItem = menuItems.find((item) =>
      pathname.includes(item.route.replace("/(tabs)", ""))
    );

    return matchedItem?.key || "contact";
  }, [pathname, menuItems]);

  const handleSelect = (key: string) => {
    const item = menuItems.find((item) => item.key === key);
    if (item && item.route) {
      router.push(item.route as Href);
    }
  };

  if (isLoadingWorkspaces) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row h-full">
        <View className="px-4 py-5 w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
          <AppText className="text-2xl font-bold text-gray-900 dark:text-white">Settings</AppText>
          <SidebarMenu items={menuItems} selectedKey={selectedKey} onSelect={handleSelect} />
        </View>

        <View className="flex-1 items-center">{children}</View>
      </View>
    </SafeAreaView>
  );
}
