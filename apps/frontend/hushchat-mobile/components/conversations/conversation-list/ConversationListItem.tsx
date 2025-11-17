/**
 * ConversationListItem
 *
 * Renders a single row in the conversations list (avatar, name, last message preview, timestamp).
 */
import {
  View,
  TouchableOpacity,
  Pressable,
  GestureResponderEvent,
  Modal,
  StyleSheet,
} from "react-native";
import React, { useCallback, useState, useRef } from "react";
import { IConversation } from "@/types/chat/types";
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

const BG = {
  modalBackdrop: "rgba(0,0,0,0.7)",
};

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
  const lastMessageText = lastMessage?.messageText;
  const lastMessageTime = getLastMessageTime(lastMessage?.createdAt || "");

  const handleOptionsPress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation();
    chevronButtonRef.current?.measure((_fx, _fy, _w, h, px, py) => {
      setMenuPosition({ x: px, y: py + h });
      setShowOptions(true);
    });
  }, []);

  const handleOptionsClose = useCallback(() => {
    setShowOptions(false);
  }, []);

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
                <View style={styles.pinRotate}>
                  <MaterialIcons name="push-pin" size={14} color="#3B82F6" />
                </View>
              )}
              <AppText className="text-gray-500 dark:text-text-secondary-dark text-sm">
                {lastMessageTime}
              </AppText>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <AppText
              className="text-gray-600 dark:text-text-secondary-dark text-sm flex-1"
              numberOfLines={1}
            >
              {lastMessage?.isUnsend ? (
                <LastMessagePreview unsendMessage={lastMessage} />
              ) : (
                lastMessageText
              )}
            </AppText>
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
        <Pressable style={styles.modalBackdrop} onPress={() => setShowProfileModal(false)}>
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

const styles = StyleSheet.create({
  pinRotate: {
    transform: [{ rotate: "45deg" }],
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG.modalBackdrop,
  },
});
