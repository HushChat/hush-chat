import React from "react";
import { GestureResponderEvent, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";
import { copyToClipboard } from "@/utils/messageUtils";
import { MessageAction } from "@/components/conversations/conversation-thread/message-list/MessageAction";

interface IMessageActionsProps {
  messageText?: string;
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
  currentUserId: string;
  isCurrentUser?: boolean;
}

export const MessageActions: React.FC<IMessageActionsProps> = ({
  messageText,
  messageIsUnsend,
  selectionMode,
  onOpenPicker,
  onOpenMenu,
  currentUserId,
  isCurrentUser,
}) => {
  if (!PLATFORM.IS_WEB || messageIsUnsend) return null;

  const handleCopy = () => {
    if (messageText) {
      copyToClipboard(messageText);
    }
  };

  const CopyIconContent = (
    <Ionicons
      name="copy-outline"
      size={16}
      className="text-text-secondary-light dark:text-text-secondary-dark"
    />
  );

  return (
    <View className="flex-row items-center">
      {!isCurrentUser && (
        <MessageAction onPress={handleCopy} style={{ marginLeft: 6 }}>
          {CopyIconContent}
        </MessageAction>
      )}

      <MessageAction onPress={onOpenPicker} disabled={!currentUserId || selectionMode}>
        <View className="p-1 rounded items-center justify-center">
          <Ionicons name="happy-outline" size={16} color="#9CA3AF" />
        </View>
      </MessageAction>

      {isCurrentUser && (
        <MessageAction onPress={handleCopy} style={{ marginLeft: 6 }}>
          {CopyIconContent}
        </MessageAction>
      )}

      <MessageAction onPress={onOpenMenu} disabled={selectionMode} style={{ marginLeft: 6 }}>
        <View className="p-1 rounded items-center justify-center">
          <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
        </View>
      </MessageAction>
    </View>
  );
};
