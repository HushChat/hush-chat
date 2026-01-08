import React from "react";
import { GestureResponderEvent, View } from "react-native";
import RefreshButton from "@/components/RefreshButton";
import KebabMenuButton from "@/components/KebabMenuButton";
import WebContextMenu from "@/components/WebContextMenu";
import { useContextMenu } from "@/hooks/useContextMenu";
import { ConversationType, IOption } from "@/types/chat/types";
import BackButton from "@/components/BackButton";
import { AppText } from "@/components/AppText";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";
import { SoundToggleButton } from "@/components/conversations/SoundToggleButton";
import { useConversationHeaderTitle } from "@/hooks/useConversationHeaderTitle";

type TChatHeaderMenuProps = {
  onRefresh: () => void;
  isLoading: boolean;
  onCreateGroup?: () => void | Promise<void>;
  onOpenMentionedMessages: () => void | Promise<void>;
  onLogout: () => void | Promise<void>;
  selectedConversationType: ConversationType;
  setSelectedConversationType: (newConversationType: ConversationType) => void;
};

export const ConversationHeader = ({
  onRefresh,
  isLoading,
  onCreateGroup,
  onOpenMentionedMessages,
  onLogout,
  selectedConversationType,
  setSelectedConversationType,
}: TChatHeaderMenuProps) => {
  const { visible, position, openAtEvent, close } = useContextMenu();

  const headerTitle = useConversationHeaderTitle(selectedConversationType);

  const options: IOption[] = [
    {
      id: 1,
      name: "New Group",
      iconName: "people-outline",
      action: () => {
        if (onCreateGroup) return onCreateGroup();
      },
    },
    {
      id: 2,
      name: "Mentioned messages",
      iconName: "at-outline",
      action: () => {
        if (onOpenMentionedMessages) return onOpenMentionedMessages();
      },
    },
    {
      id: 3,
      name: "Logout",
      iconName: "log-out-outline",
      action: () => {
        if (onLogout) return onLogout();
      },
    },
  ];

  const handleKebabPress = (e: GestureResponderEvent) => openAtEvent(e);

  const handleOptionSelect = async (action: () => void | Promise<void>) => {
    await action();
    close();
  };

  return (
    <View className="px-6 py-4 flex-row items-center">
      <View className="flex-row items-center flex-1">
        {selectedConversationType === ConversationType.ARCHIVED && (
          <BackButton onPress={() => setSelectedConversationType(ConversationType.ALL)} />
        )}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white">
          {headerTitle}
        </AppText>
      </View>
      <View className="flex-row items-center gap-3">
        <WebSocketStatusIndicator />
        <RefreshButton onRefresh={onRefresh} isLoading={isLoading} color="#6B7280" />
        <SoundToggleButton />
        <KebabMenuButton onPress={handleKebabPress} />
        <WebContextMenu
          visible={visible}
          position={position}
          onClose={close}
          options={options}
          onOptionSelect={handleOptionSelect}
        />
      </View>
    </View>
  );
};
