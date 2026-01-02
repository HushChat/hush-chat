import React, { useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MotionView } from "@/motion/MotionView";
import ErrorView from "@/components/ErrorView";
import { Images } from "@/assets/images";
import { useConversationByIdQuery } from "@/query/useConversationByIdQuery";
import OneToOneChatInfo from "@/components/conversations/conversation-info-panel/OneToOneChatInfo";
import GroupChatInfo from "@/components/conversations/conversation-info-panel/GroupChatInfo";
import { AppText } from "@/components/AppText";
import { PanelType } from "@/types/web-panel/types";
import MediaAttachmentsView from "@/components/conversations/conversation-info-panel/MediaAttachmentsView";
import GroupPreferences from "@/components/conversations/conversation-info-panel/GroupPreferences";

export interface ChatInfoScreenProps {
  conversationId: number;
  onClose?: () => void;
  isWebView?: boolean;
  setSelectedConversation?: (conversation: null) => void;
}

export default function ConversationInfoPanel({
  conversationId,
  onClose,
  setSelectedConversation = () => {},
}: ChatInfoScreenProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const router = useRouter();
  const [currentPanel, setCurrentPanel] = useState<PanelType>(PanelType.PROFILE);

  const {
    conversationAPIResponse,
    conversationAPILoading,
    conversationAPIError,
    refetchConversation,
  } = useConversationByIdQuery(conversationId);

  const handleBack = () => {
    if (
      currentPanel === PanelType.MEDIA_ATTACHMENTS ||
      currentPanel === PanelType.GROUP_PREFERENCES
    ) {
      setCurrentPanel(PanelType.PROFILE);
    } else {
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    }
  };

  const handleShowMediaAttachments = () => {
    setCurrentPanel(PanelType.MEDIA_ATTACHMENTS);
  };

  const handleGroupPreferences = () => {
    setCurrentPanel(PanelType.GROUP_PREFERENCES);
  };

  if (conversationAPILoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background, paddingTop: insets.top + 12 },
        ]}
      >
        <ActivityIndicator size="large" color="#3b82f6" />
        <AppText className="mt-4 text-gray-600 dark:text-text-secondary-dark">
          Loading conversation...
        </AppText>
      </View>
    );
  }

  if (conversationAPIError || !conversationAPIResponse) {
    return (
      <ErrorView
        title="Conversation"
        message={conversationAPIError?.message || "Unable to load conversation details"}
        onBack={handleBack}
        onRetry={refetchConversation}
        imageSource={Images.NoConversationFound}
      />
    );
  }

  const { isGroup } = conversationAPIResponse;

  const renderContent = () => {
    switch (currentPanel) {
      case PanelType.MEDIA_ATTACHMENTS:
        return <MediaAttachmentsView conversationId={conversationId} onBack={handleBack} />;

      case PanelType.GROUP_PREFERENCES:
        return (
          <GroupPreferences
            conversation={conversationAPIResponse}
            visible={true}
            onClose={handleBack}
          />
        );

      case PanelType.PROFILE:
      default:
        return isGroup ? (
          <GroupChatInfo
            conversation={conversationAPIResponse}
            onBack={handleBack}
            setSelectedConversation={setSelectedConversation}
            onShowMediaAttachments={handleShowMediaAttachments}
            onShowGroupPreferences={handleGroupPreferences}
          />
        ) : (
          <OneToOneChatInfo
            conversation={conversationAPIResponse}
            onBack={handleBack}
            setSelectedConversation={setSelectedConversation}
            onShowMediaAttachments={handleShowMediaAttachments}
            onShowGroupPreferences={handleGroupPreferences}
          />
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark border-l border-gray-200 dark:border-gray-800">
      <MotionView visible={true} preset="slideUp" duration={500} style={styles.flex1}>
        {renderContent()}
      </MotionView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
});
