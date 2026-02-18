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
import { Divider } from "@/components/ui/Divider";

const ConversationListItem = ({
  conversation,
  handleChatPress,
  isConversationSelected,
  handleArchivePress,
  handleDeletePress,
  conversationsRefetch,
  showDivider = true,
}: {
  conversation: IConversation;
  handleChatPress: () => void;
  isConversationSelected: boolean;
  handleArchivePress: (conversationId: number) => void;
  handleDeletePress: (conversationId: number) => void;
  conversationsRefetch: () => void;
  showDivider?: boolean;
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showProfileModal, setShowProfileModal] = useState(false);

  const chevronButtonRef = useRef<View>(null);

  const lastMessage = conversation.messages?.at(-1);
  const lastMessageTime = getLastMessageTime(lastMessage?.createdAt || "");
  const hasUnread = conversation.unreadCount > 0;

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
          PLATFORM.IS_WEB &&
            "mx-1 rounded-2xl hover:bg-secondary-light dark:hover:bg-secondary-dark",
          {
            "bg-background-light dark:bg-background-dark": !isConversationSelected,
            "bg-secondary-light dark:bg-secondary-dark": isConversationSelected,
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
            deviceType={conversation.deviceType}
          />
        </TouchableOpacity>

        <View className="flex-1 mr-3">
          <View className="flex-row items-center justify-between mb-1">
            <AppText
              className={classNames(
                "text-text-primary-light dark:text-text-primary-dark text-base",
                hasUnread ? "font-semibold" : "font-medium"
              )}
            >
              {conversation.name}
            </AppText>
            <View className="flex-row items-center gap-1">
              {conversation.pinnedByLoggedInUser && (
                <View className="rotate-45">
                  <MaterialIcons name="push-pin" size={14} color="#6B4EFF" />
                </View>
              )}
              <AppText
                className={classNames(
                  "text-sm",
                  hasUnread
                    ? "text-primary-light dark:text-primary-dark font-medium"
                    : "text-gray-500 dark:text-text-secondary-dark"
                )}
              >
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
              isGroup={conversation.isGroup}
              hasUnread={hasUnread}
            />
          </View>
        </View>
      </Pressable>

      {showDivider && <Divider indent={76} />}

      <ConversationWebContextMenu
        visible={showOptions}
        position={menuPosition}
        onClose={handleOptionsClose}
        conversationId={conversation.id}
        isFavorite={conversation.favoriteByLoggedInUser}
        isPinned={conversation.pinnedByLoggedInUser}
        isMuted={conversation.mutedByLoggedInUser}
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
