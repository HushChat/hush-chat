import Contact from "@/app/settings/contact";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { AppText } from "@/components/AppText";
import SidebarMenu, { SidebarMenuItem } from "@/components/SidebarMenu";
import { getSettingsMenuItems, settingsPanels } from "@/configs/settingsMenu";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";

export default function Settings() {
  const [selected, setSelected] = useState("contact");
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);

  const { workspaces, isLoadingWorkspaces } = useUserWorkspacesQuery();

  useEffect(() => {
    const loadMenuItems = () => {
      const workspaceCount = workspaces ? workspaces.length : 0;
      const items = getSettingsMenuItems({ workspaceCount });
      setMenuItems(items);

      if (items.length > 0 && !items.find((i) => i.key === selected)) {
        setSelected(items[0].key);
      }
    };

    loadMenuItems();
  }, [workspaces]);

  const SelectedPanel = settingsPanels[selected] ?? Contact;

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
          <SidebarMenu items={menuItems} selectedKey={selected} onSelect={setSelected} />
        </View>

        <View className="flex-1 items-center">
          <SelectedPanel />
        </View>
      </View>
    </SafeAreaView>
  );
}
