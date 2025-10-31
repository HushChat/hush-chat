import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Placeholder from "@/components/Placeholder";
import { Images } from "@/assets/images";

export default function SettingsPlaceholderWeb() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1">
        <Placeholder
          image={Images.Settings}
          title="Settings"
          showBackground={false}
          imageWidth={50}
          imageHeight={80}
        />
      </View>
    </SafeAreaView>
  );
}
