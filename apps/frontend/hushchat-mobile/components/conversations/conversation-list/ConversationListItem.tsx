/**
 * ConversationListItem
 *
 * Renders a single row in the conversations list (avatar, name, last message preview, timestamp).
 */
import { View, TouchableOpacity, Pressable, GestureResponderEvent, Modal } from "react-native";
import React, { useCallback, useState, useRef, useMemo } from "react";
import { AttachmentType, IConversation } from "@/types/chat/types";
import { getLastMessageTime } from "@/utils/commonUtils";
import InitialsAvatar from "@/components/InitialsAvatar";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import classNames from "classnames";
import ChevronButton from "@/components/ChevronButton";
import ConversationWebContextMenu from "@/components/conversations/WebConversationContextMenu";
import { MaterialIcons } from "@expo/vector-icons";
import ProfilePictureModalContent from "@/components/ProfilePictureModelContent";
import LastMessagePreview from "@/components/UnsendMessagePreview";
import { AppText } from "@/components/AppText";

const ConversationListItem = ({
  conversation,
  handleChatPress,
  isConversationSelected,
  handleArchivePress,
  handleDeletePress,
  conversationsRefetch,
}: {
  conversation: IConversation;
  handleChatPress: () => void;
  isConversationSelected: boolean;
  handleArchivePress: (conversationId: number) => void;
  handleDeletePress: (conversationId: number) => void;
  conversationsRefetch: () => void;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showProfileModal, setShowProfileModal] = useState(false);

  const chevronButtonRef = useRef<View>(null);
  const lastMessage = conversation.messages?.at(-1);

  const lastMessageText = useMemo(() => {
    if (!lastMessage) return "";

    const attachments = (lastMessage as any).attachments || lastMessage.messageAttachments || [];
    const messageText = lastMessage.messageText?.trim();

    if (messageText) return messageText;

    if (attachments.length > 0) {
      let imageCount = 0;
      let docCount = 0;

      attachments.forEach((attachment: any) => {
        if (attachment.attachmentType === AttachmentType.IMAGE) {
          imageCount++;
        } else if (attachment.attachmentType === AttachmentType.DOCUMENT) {
          docCount++;
        }
      });

      if (imageCount > 0 && docCount === 0) {
        return imageCount === 1 ? "Photo" : `${imageCount} Photos`;
      }
      if (docCount > 0 && imageCount === 0) {
        return docCount === 1 ? "Document" : `${docCount} Documents`;
      }
      if (imageCount > 0 && docCount > 0) {
        return `${imageCount} Photo${imageCount > 1 ? "s" : ""} & ${docCount} Document${
          docCount > 1 ? "s" : ""
        }`;
      }
    }

    return "";
  }, [lastMessage]);

  const lastMessageTime = getLastMessageTime(lastMessage?.createdAt || "");

  const handleOptionsPress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    if (chevronButtonRef.current) {
      chevronButtonRef.current.measure(
        (fx: number, fy: number, width: number, height: number, px: number, py: number) => {
          setMenuPosition({
            x: px,
            y: py + height,
          });
          setShowOptions(true);
        }
      );
    }
  }, []);

  const handleOptionsClose = useCallback(() => {
    setShowOptions(false);
  }, []);

  const attachmentIconInfo = useMemo(() => {
    if (!lastMessage) return null;

    const attachments = (lastMessage as any).attachments || lastMessage.messageAttachments || [];

    if (attachments.length === 0) return null;

    let hasImages = false;
    let hasDocs = false;

    attachments.forEach((attachment: any) => {
      if (attachment.attachmentType === AttachmentType.IMAGE) {
        hasImages = true;
      } else if (attachment.attachmentType === AttachmentType.DOCUMENT) {
        hasDocs = true;
      }
    });

    if (hasImages && !hasDocs) {
      return { name: "photo" as const, show: true };
    }
    if (hasDocs && !hasImages) {
      return { name: "insert-drive-file" as const, show: true };
    }
    if (hasImages && hasDocs) {
      return { name: "photo" as const, show: true };
    }

    return null;
  }, [lastMessage]);

  return (
    <>
      <Pressable
        className={classNames(
          "group flex-row items-center gap-3 px-4 py-3 active:bg-secondary-light dark:active:bg-secondary-dark",
          PLATFORM.IS_WEB && "mx-1 rounded-2xl hover:bg-blue-100/60 hover:dark:bg-secondary-dark",
          {
            "bg-background-light dark:bg-background-dark": !isConversationSelected,
            "bg-blue-100/60 dark:bg-secondary-dark": isConversationSelected,
          }
        )}
        onPress={handleChatPress}
      >
        <TouchableOpacity
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          onPress={(e) => {
            e.stopPropagation();
            setShowProfileModal(true);
          }}
        >
          <InitialsAvatar name={conversation.name} imageUrl={conversation.signedImageUrl} />
        </TouchableOpacity>

        <View className="flex-1 mr-3">
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
              {conversation.name}
            </AppText>
            <View className="flex-row items-center gap-1">
              {conversation.pinnedByLoggedInUser && (
                <View style={{ transform: [{ rotate: "45deg" }] }}>
                  <MaterialIcons name="push-pin" size={14} color="#3B82F6" />
                </View>
              )}
              <AppText className="text-gray-500 dark:text-text-secondary-dark text-sm">
                {lastMessageTime}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-1 flex-1">
              {lastMessage?.isUnsend ? (
                <LastMessagePreview unsendMessage={lastMessage} />
              ) : (
                <>
                  {attachmentIconInfo?.show && (
                    <MaterialIcons
                      name={attachmentIconInfo.name}
                      size={16}
                      color="#6B7280"
                      style={{ marginRight: 4 }}
                    />
                  )}

                  <AppText
                    className="text-gray-600 dark:text-text-secondary-dark text-sm flex-shrink"
                    numberOfLines={1}
                  >
                    {lastMessageText}
                  </AppText>
                </>
              )}
            </View>
            {conversation.mutedByLoggedInUser && (
              <MaterialIcons name="notifications-off" size={14} color="#9CA3AF" className="ml-2" />
            )}

            {PLATFORM.IS_WEB && (
              <ChevronButton
                chevronButtonRef={chevronButtonRef}
                handleOptionsPress={handleOptionsPress}
              />
            )}
          </View>
        </View>
      </Pressable>

      <ConversationWebContextMenu
        visible={showOptions}
        position={menuPosition}
        onClose={handleOptionsClose}
        conversationId={conversation.id}
        isFavorite={conversation.favoriteByLoggedInUser}
        handleArchivePress={handleArchivePress}
        handleDeletePress={handleDeletePress}
        conversationsRefetch={conversationsRefetch}
      />

      <Modal
        visible={showProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProfileModal(false)}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
          onPress={() => setShowProfileModal(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-background-light dark:bg-background-dark rounded-2xl p-6 max-w-xs w-full"
          >
            <AppText className="text-center text-text-primary-light dark:text-text-primary-dark text-lg font-semibold mb-4">
              {conversation.name}
            </AppText>

            <ProfilePictureModalContent conversation={conversation} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default ConversationListItem;
