import Contact from "@/app/settings/contact";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import SidebarMenu from "@/components/SidebarMenu";
import { settingsMenuItems, settingsPanels } from "@/configs/settingsMenu";

export default function Settings() {
  const [selected, setSelected] = useState("contact");

  const SelectedPanel = settingsPanels[selected] ?? Contact;

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row h-full">
        <View className="px-4 py-5 w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
          <AppText className="text-2xl font-bold text-gray-900 dark:text-white">Settings</AppText>
          <SidebarMenu items={settingsMenuItems} selectedKey={selected} onSelect={setSelected} />
        </View>

        <View className="flex-1 items-center">
          <SelectedPanel />
        </View>
      </View>
    </SafeAreaView>
  );
}
