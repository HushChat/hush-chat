import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import BackButton from "@/components/BackButton";
import { CHAT_VIEW_PATH } from "@/constants/routes";
import GroupConfigurationForm from "@/components/conversations/conversation-list/group-conversation-creation/GroupConfigurationForm";
import { AppText } from "@/components/AppText";

const MobileGroupCreation = ({ participantUserIds }: { participantUserIds: number[] }) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        style={{ paddingTop: insets.top + 12 }}
        className="px-4 py-3 flex-row items-center border-b border-gray-200 dark:border-gray-800"
      >
        <BackButton onPress={() => router.back()} />
        <AppText className="ml-3 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          New Group
        </AppText>
      </View>

      <GroupConfigurationForm
        participantUserIds={participantUserIds}
        onSuccess={(conversationId) =>
          router.replace({
            pathname: CHAT_VIEW_PATH,
            params: { conversationId },
          })
        }
      />
    </View>
  );
};

export default MobileGroupCreation;
