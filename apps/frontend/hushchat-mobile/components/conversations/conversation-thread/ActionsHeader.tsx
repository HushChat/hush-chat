import React, { useCallback, useMemo } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import {
  IMessage,
  ConversationAPIResponse,
  PIN_MESSAGE_OPTIONS,
  MessageTypeEnum,
} from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";
import HeaderAction from "@/components/conversations/conversation-info-panel/common/HeaderAction";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { isImageAttachment, isVideoAttachment } from "@/utils/messageHelpers";
import { downloadFileNative } from "@/utils/messageUtils";
import { ToastUtils } from "@/utils/toastUtils";

interface ActionsHeaderProps {
  message: IMessage;
  conversation?: ConversationAPIResponse;
  onClose: () => void;
  onPinToggle: (m: IMessage, duration: string | null) => void;
  onForward: (m: IMessage) => void;
  onUnsend: (m: IMessage) => void;
  onCopy: (m: IMessage) => void;
  onSelectMessageInfo?: (c: ConversationAPIResponse, m: IMessage) => void;
  onMarkAsUnread: (m: IMessage) => void;
  onEdit?: (m: IMessage) => void;
}

const ActionsHeader = ({
  message,
  conversation,
  onClose,
  onPinToggle,
  onForward,
  onUnsend,
  onCopy,
  onSelectMessageInfo,
  onMarkAsUnread,
  onEdit,
}: ActionsHeaderProps) => {
  const { user } = useUserStore();
  const { openModal, closeModal } = useModalContext();
  const isPinned = conversation?.pinnedMessage?.id === message?.id;
  const isForwardedMessage = message.isForwarded;
  const currentUserIsSender = user?.id === message?.senderId;

  const isAttachmentOnly = message?.messageType === MessageTypeEnum.ATTACHMENT;
  const hasText = !!message?.messageText;
  const canEdit = currentUserIsSender && !message?.isUnsend && hasText && !isAttachmentOnly;

  const documentAttachments = useMemo(() => {
    if (!message?.messageAttachments) return [];

    return message.messageAttachments.filter(
      (attachment) => !isImageAttachment(attachment) && !isVideoAttachment(attachment)
    );
  }, [message?.messageAttachments]);

  const hasDocumentAttachments = documentAttachments.length > 0;

  const handleTogglePinMessage = useCallback(() => {
    if (isPinned) {
      onPinToggle(message, null);
      return;
    }

    openModal({
      type: MODAL_TYPES.confirm,
      title: "Pin Message",
      description: "Select how long you want to pin this message",
      buttons: [
        ...PIN_MESSAGE_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            onPinToggle(message, option.value);
            closeModal();
          },
        })),
        {
          text: "Cancel",
          onPress: closeModal,
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "pin-outline",
    });
  }, [isPinned, openModal, PIN_MESSAGE_OPTIONS, closeModal]);

  const handleDownload = useCallback(async () => {
    if (documentAttachments.length === 0) return;

    try {
      const firstDocument = documentAttachments[0];
      await downloadFileNative(firstDocument);
    } catch {
      ToastUtils.error("Failed to download document");
    }
  }, [documentAttachments]);

  const handleEdit = useCallback(() => {
    if (canEdit && onEdit) {
      onEdit(message);
    }
  }, [canEdit, onEdit, message]);

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
          {message.senderId !== Number(user.id) && !message.isUnsend && (
            <HeaderAction iconName="mail-unread-outline" onPress={() => onMarkAsUnread(message)} />
          )}
          {hasDocumentAttachments && (
            <HeaderAction iconName="download-outline" onPress={handleDownload} />
          )}
          {!message.isUnsend && message.messageText && (
            <HeaderAction iconName="copy-outline" onPress={() => onCopy(message)} />
          )}
          {canEdit && !isForwardedMessage && onEdit && (
            <HeaderAction iconName="pencil-outline" onPress={handleEdit} />
          )}
          {message.senderId === Number(user.id) && !message.isUnsend && (
            <HeaderAction iconName="trash-outline" onPress={() => onUnsend(message)} />
          )}

          {!conversation?.onlyAdminsCanPinMessages ||
            (conversation?.isCurrentUserAdmin && (
              <HeaderAction
                iconName={isPinned ? "pin" : "pin-outline"}
                onPress={() => handleTogglePinMessage()}
                color={isPinned ? "#6B4EFF" : "#6B7280"}
              />
            ))}

          {currentUserIsSender &&
            !message.isUnsend &&
            (message.messageText || message.hasAttachment) &&
            conversation &&
            onSelectMessageInfo && (
              <HeaderAction
                iconName="information-circle-outline"
                onPress={() => onSelectMessageInfo(conversation, message)}
              />
            )}
          <HeaderAction iconName="arrow-redo-outline" onPress={() => onForward(message)} />
        </View>
      </View>
    </View>
  );
};

export default ActionsHeader;
