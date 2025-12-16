import { View, TouchableOpacity, Pressable, GestureResponderEvent } from "react-native";
import React, { useCallback, useState, useRef } from "react";
import { IConversation } from "@/types/chat/types";
import { getLastMessageTime } from "@/utils/commonUtils";
import InitialsAvatar from "@/components/InitialsAvatar";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import classNames from "classnames";
import ConversationWebContextMenu from "@/components/conversations/WebConversationContextMenu";
import { MaterialIcons } from "@expo/vector-icons";
import { ProfileCardModal } from "@/components/ProfileCardModal";
import { AppText } from "@/components/AppText";
import ConversationMeta from "@/components/conversations/conversation-info-panel/ConversationMeta";

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

  const secondaryText = conversation.isGroup ? "Group Chat" : "Private Chat";

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
        accessibilityRole="button"
      >
        <TouchableOpacity
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          onPress={(e) => {
            e.stopPropagation();
            setShowProfileModal(true);
          }}
        >
          <InitialsAvatar
            name={conversation.name}
            imageUrl={conversation.signedImageUrl}
            userStatus={conversation.chatUserStatus}
            showOnlineStatus={!conversation.isGroup}
          />
        </TouchableOpacity>

        <View className="flex-1 mr-3">
          <View className="flex-row items-center justify-between mb-1">
            <AppText className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
              {conversation.name}
            </AppText>
            <View className="flex-row items-center gap-1">
              {conversation.pinnedByLoggedInUser && (
                <View className="rotate-45">
                  <MaterialIcons name="push-pin" size={14} color="#3B82F6" />
                </View>
              )}
              <AppText className="text-gray-500 dark:text-text-secondary-dark text-sm">
                {lastMessageTime}
              </AppText>
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <ConversationMeta
              lastMessage={lastMessage}
              muted={conversation.mutedByLoggedInUser}
              unreadCount={conversation.unreadCount}
              chevronButtonRef={chevronButtonRef}
              onChevronPress={handleOptionsPress}
            />
          </View>
        </View>
      </Pressable>

      <ConversationWebContextMenu
        visible={showOptions}
        position={menuPosition}
        onClose={handleOptionsClose}
        conversationId={conversation.id}
        isFavorite={conversation.favoriteByLoggedInUser}
        isPinned={conversation.pinnedByLoggedInUser}
        handleArchivePress={handleArchivePress}
        handleDeletePress={handleDeletePress}
        conversationsRefetch={conversationsRefetch}
      />

      <ProfileCardModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        data={{
          name: conversation.name,
          imageUrl: conversation.signedImageUrl,
          isGroup: conversation.isGroup,
          username: secondaryText,
        }}
      />
    </>
  );
};

export default ConversationListItem;
