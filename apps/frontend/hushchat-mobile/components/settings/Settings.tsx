import Contact from "@/app/settings/contact";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import SidebarMenu, { SidebarMenuItem } from "@/components/SidebarMenu";
import { getSettingsMenuItems, settingsPanels } from "@/configs/settingsMenu";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { Typography } from "@/components/ui/Typography";
import { Surface } from "@/components/ui/Surface";
import { Divider } from "@/components/ui/Divider";

export default function Settings() {
  const { user } = useUserStore();
  const [selected, setSelected] = useState("contact");
  const [menuItems, setMenuItems] = useState<SidebarMenuItem[]>([]);
  const workspaceRole = user?.workspaceRole;

  const { workspaces, isLoadingWorkspaces } = useUserWorkspacesQuery();

  useEffect(() => {
    const loadMenuItems = () => {
      const workspaceCount = workspaces ? workspaces.length : 0;
      const items = getSettingsMenuItems({ workspaceCount }, workspaceRole);

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
        <Surface
          elevation="card"
          className="px-4 py-5 w-[470px] min-w-72 max-w-2xl lg:w-[460px] rounded-none border-r border-divider-light dark:border-divider-dark"
        >
          <Typography variant="h1" className="mb-2">
            Settings
          </Typography>
          <Divider className="mb-3" />
          <SidebarMenu items={menuItems} selectedKey={selected} onSelect={setSelected} />
        </Surface>

        <View className="flex-1 items-center">
          <SelectedPanel />
        </View>
      </View>
    </SafeAreaView>
  );
}
