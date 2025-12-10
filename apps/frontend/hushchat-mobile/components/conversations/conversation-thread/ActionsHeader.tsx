import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import { IMessage, ConversationAPIResponse, IMessageAttachment } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";
import HeaderAction from "@/components/conversations/conversation-info-panel/common/HeaderAction";
import { getFileType } from "@/utils/files/getFileType";

interface ActionsHeaderProps {
  message: IMessage;
  selectedAttachment?: IMessageAttachment | null;
  conversation?: ConversationAPIResponse;
  onClose: () => void;
  onPinToggle: (m: IMessage) => void;
  onForward: (m: IMessage) => void;
  onUnsend: (m: IMessage) => void;
  onCopy: (m: IMessage) => void;
  onDownload: (attachment: IMessageAttachment) => void;
}

const ActionsHeader = ({
  message,
  selectedAttachment,
  conversation,
  onClose,
  onPinToggle,
  onForward,
  onUnsend,
  onCopy,
  onDownload,
}: ActionsHeaderProps) => {
  debugger;
  const { user } = useUserStore();
  const isPinned = conversation?.pinnedMessage?.id === message?.id;
  const downloadableAttachment = selectedAttachment || 
    message?.messageAttachments?.find(att => getFileType(att.originalFileName) !== 'image');

  return (
    <View className="absolute bottom-full !z-50 w-full bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <TouchableOpacity onPress={onClose} hitSlop={DEFAULT_HIT_SLOP}>
            <Ionicons
              name="close-outline"
              size={22}
              className="!text-text-primary-light dark:!text-text-primary-dark"
            />
          </TouchableOpacity>

          <View className="flex-1">
            <AppText
              className="text-base font-medium text-text-primary-light dark:text-text-primary-dark"
              numberOfLines={1}
            >
              {message?.senderFirstName} {message?.senderLastName}
            </AppText>
            <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {new Date(message?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </AppText>
          </View>
        </View>


        <View className="flex-row items-center gap-2">
          {downloadableAttachment && (
            <HeaderAction 
              iconName="download-outline" 
              onPress={() => onDownload(downloadableAttachment)}
            />
          )}
          {!message.isUnsend && message.messageText && (
            <HeaderAction iconName="copy-outline" onPress={() => onCopy(message)} />
          )}

          {message.senderId === Number(user.id) && !message.isUnsend && (
            <HeaderAction iconName="trash-outline" onPress={() => onUnsend(message)} />
          )}

          <HeaderAction
            iconName={isPinned ? "pin" : "pin-outline"}
            onPress={() => onPinToggle(message)}
            color={isPinned ? "#6B4EFF" : "#6B7280"}
          />

          <HeaderAction iconName="arrow-redo-outline" onPress={() => onForward(message)} />
        </View>
      </View>
    </View>
  );
};

export default ActionsHeader;
