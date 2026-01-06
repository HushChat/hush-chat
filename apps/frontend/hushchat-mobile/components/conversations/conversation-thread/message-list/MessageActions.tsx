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
  showReaction?: boolean;
  showMenu?: boolean;
  showCopy?: boolean;
}

export const MessageActions: React.FC<IMessageActionsProps> = ({
  messageText,
  messageIsUnsend,
  selectionMode,
  onOpenPicker,
  onOpenMenu,
  currentUserId,
  isCurrentUser,
  showReaction = true,
  showMenu = true,
  showCopy = true,
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
      {showCopy && !isCurrentUser && (
        <MessageAction onPress={handleCopy}>{CopyIconContent}</MessageAction>
      )}
      {showReaction && (
        <MessageAction onPress={onOpenPicker} disabled={!currentUserId || selectionMode}>
          <View className="p-1 rounded items-center justify-center">
            <Ionicons name="happy-outline" size={16} color="#9CA3AF" />
          </View>
        </MessageAction>
      )}

      {showCopy && isCurrentUser && (
        <MessageAction onPress={handleCopy}>{CopyIconContent}</MessageAction>
      )}

      {showMenu && (
        <MessageAction onPress={onOpenMenu} disabled={selectionMode} style={{ marginLeft: 6 }}>
          <View className="p-1 rounded items-center justify-center">
            <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
          </View>
        </MessageAction>
      )}
    </View>
  );
};
