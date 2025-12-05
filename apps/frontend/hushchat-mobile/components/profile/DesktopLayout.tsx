import React, { ReactNode } from "react";
import { View, ScrollView } from "react-native";
import Placeholder from "@/components/Placeholder";
import { Images } from "@/assets/images";
import { profileStyles } from "@/components/profile/profile.styles";

interface DesktopLayoutProps {
  children: ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
  return (
    <ScrollView
      horizontal={true}
      style={profileStyles.desktopScrollContainer}
      className="custom-scrollbar"
      contentContainerStyle={profileStyles.desktopContentContainer}
      showsHorizontalScrollIndicator={true}
    >
      <View className="flex-1 flex-row">
        <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
          {children}
        </View>
        <View className="flex-1">
          <Placeholder
            image={Images.userProfile}
            title="My Profile"
            showBackground={false}
            imageWidth={50}
            imageHeight={80}
          />
        </View>
      </View>
    </ScrollView>
  );
}
