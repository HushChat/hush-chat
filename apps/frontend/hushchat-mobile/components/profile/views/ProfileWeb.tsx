import { ScrollView, StyleSheet, View } from "react-native";
import Placeholder from "@/components/Placeholder";
import { Images } from "@/assets/images";
import React from "react";
import { ProfileForm } from "@/components/profile/components/ProfileForm";

const MIN_DESKTOP_WIDTH = 900;

export const ProfileWeb = () => {
  return (
    <ScrollView
      horizontal={true}
      className="custom-scrollbar flex-1"
      contentContainerStyle={styles.desktopContentContainer}
      showsHorizontalScrollIndicator={true}
    >
      <View className="flex-1 flex-row">
        <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
          <ProfileForm />
        </View>
        <View className="flex-1">
          <Placeholder
            image={Images.userProfile}
            title="My ProfileForm"
            showBackground={false}
            imageWidth={50}
            imageHeight={80}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  desktopContentContainer: {
    flexGrow: 1,
    minWidth: MIN_DESKTOP_WIDTH,
  },
});
