import React, { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY, DEFAULT_HIT_SLOP } from "@/constants/ui";
import { handleConversationNavigation } from "@/utils/commonUtils";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { TypingIndicator } from "@/components/conversations/conversation-thread/TypingIndicator";
import { eventBus } from "@/services/eventBus";
import { USER_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { chatUserStatus, ConversationInfo, DeviceType, IUserStatus } from "@/types/chat/types";
import RefreshButton from "@/components/RefreshButton";

interface ChatHeaderProps {
  conversationInfo: ConversationInfo;
  onBackPress?: () => void;
  onShowProfile: () => void;
  refetchConversationMessages: () => void;
  isLoadingConversationMessages: boolean;
  webPressSearch?: () => void;
  isGroupChat: boolean;
}

const ChatHeader = ({
  conversationInfo,
  onBackPress,
  onShowProfile,
  refetchConversationMessages,
  isLoadingConversationMessages,
  webPressSearch,
  isGroupChat,
}: ChatHeaderProps) => {
  const isMobileLayout = useIsMobileLayout();

  const [userPresence, setUserPresence] = useState<{
    status: chatUserStatus;
    deviceType: DeviceType;
  } | null>(null);

  const currentStatus = userPresence?.status ?? conversationInfo.chatUserStatus;
  const currentDevice = userPresence?.deviceType ?? conversationInfo.deviceType;

  const handleProfileNavigate = useCallback(() => {
    handleConversationNavigation(onShowProfile, conversationInfo.conversationId, isMobileLayout);
  }, [onShowProfile, conversationInfo.conversationId, isMobileLayout]);

  useEffect(() => {
    const handleStatusUpdate = (status: IUserStatus) => {
      if (
        status.conversationId === conversationInfo.conversationId &&
        status.status &&
        status.deviceType
      ) {
        setUserPresence({
          status: status.status,
          deviceType: status.deviceType,
        });
      }
    };

    eventBus.on(USER_EVENTS.PRESENCE, handleStatusUpdate);

    return () => {
      eventBus.off(USER_EVENTS.PRESENCE, handleStatusUpdate);
    };
  }, [conversationInfo.conversationId]);

  return (
    <View className="bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {isMobileLayout && (
            <TouchableOpacity onPress={onBackPress} hitSlop={DEFAULT_HIT_SLOP}>
              <Ionicons
                name="arrow-back-outline"
                size={20}
                className="!text-text-primary-light dark:!text-text-primary-dark"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleProfileNavigate}
            className="flex-row items-center gap-3 flex-1"
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <InitialsAvatar
              name={conversationInfo.conversationName}
              size={AvatarSize.small}
              imageUrl={conversationInfo.signedImageUrl}
              showOnlineStatus={true}
              userStatus={currentStatus}
              deviceType={currentDevice}
            />

            <View className="flex-1">
              <AppText
                className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark"
                numberOfLines={1}
              >
                {conversationInfo.conversationName}
              </AppText>

              <TypingIndicator
                conversationId={conversationInfo.conversationId}
                isGroupChat={isGroupChat}
              />
            </View>
          </TouchableOpacity>
        </View>

        {!isMobileLayout && (
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              onPress={webPressSearch}
            >
              <Ionicons name="search" size={20} color={"#6B7280"} />
            </TouchableOpacity>

            {__DEV__ && (
              <RefreshButton
                onRefresh={refetchConversationMessages}
                isLoading={isLoadingConversationMessages}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatHeader;
