import React from "react";
import { GestureResponderEvent, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RefreshButton from "@/components/RefreshButton";
import KebabMenuButton from "@/components/KebabMenuButton";
import WebContextMenu from "@/components/WebContextMenu";
import { useContextMenu } from "@/hooks/useContextMenu";
import { ConversationType, IOption } from "@/types/chat/types";
import BackButton from "@/components/BackButton";
import { AppText } from "@/components/AppText";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";
import { useConversationStore } from "@/store/conversation/useConversationStore";

type TChatHeaderMenuProps = {
  onRefresh: () => void;
  isLoading: boolean;
  onCreateGroup?: () => void | Promise<void>;
  selectedConversationType: ConversationType;
  setSelectedConversationType: (newConversationType: ConversationType) => void;
};

export const ConversationHeader = ({
  onRefresh,
  isLoading,
  onCreateGroup,
  selectedConversationType,
  setSelectedConversationType,
}: TChatHeaderMenuProps) => {
  const { visible, position, openAtEvent, close } = useContextMenu();

  const isSoundEnabled = useConversationStore((state) => state.isSoundEnabled);
  const toggleSoundEnabled = useConversationStore((state) => state.toggleSoundEnabled);

  const options: IOption[] = [
    {
      id: 1,
      name: "New Group",
      iconName: "people-outline",
      action: () => {
        if (onCreateGroup) return onCreateGroup();
      },
    },
  ];

  const handleKebabPress = (e: GestureResponderEvent) => openAtEvent(e);

  const handleOptionSelect = async (action: () => void | Promise<void>) => {
    await action();
  };

  return (
    <View className="px-6 py-4 flex-row items-center">
      <View className="flex-row items-center flex-1">
        {selectedConversationType === ConversationType.ARCHIVED && (
          <BackButton onPress={() => setSelectedConversationType(ConversationType.ALL)} />
        )}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedConversationType === ConversationType.ARCHIVED ? "Archived" : "Chats"}
        </AppText>
      </View>
      <View className="flex-row items-center gap-3">
        <WebSocketStatusIndicator />
        <RefreshButton onRefresh={onRefresh} isLoading={isLoading} color="#6B7280" />
        <TouchableOpacity onPress={toggleSoundEnabled} activeOpacity={0.7}>
          <Ionicons
            name={isSoundEnabled ? "volume-high-outline" : "volume-mute-outline"}
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>
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
