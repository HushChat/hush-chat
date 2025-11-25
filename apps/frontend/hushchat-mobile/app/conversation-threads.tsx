import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ImageBackground, KeyboardAvoidingView, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import ChatHeader from "@/components/conversations/conversation-thread/ChatHeader";
import ConversationMessageList from "@/components/conversations/conversation-thread/message-list/ConversationMessageList";
import EmptyChatState from "@/components/conversations/conversation-thread/message-list/EmptyChatState";
import LoadingState from "@/components/LoadingState";
import ConversationInputBar from "@/components/conversations/conversation-thread/composer/ConversationInputBar";
import DisabledMessageInput from "@/components/conversations/conversation-thread/composer/DisabledMessageInput";
import FilePreviewOverlay from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewOverlay";
import MessageForwardActionBar from "@/components/conversations/conversation-thread/composer/MessageForwardActionBar";
import Alert from "@/components/Alert";

import { useConversationByIdQuery } from "@/query/useConversationByIdQuery";
import { useSendMessageMutation } from "@/query/post/queries";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useImagePreview } from "@/hooks/useImagePreview";

import { Images } from "@/assets/images";
import { PLATFORM } from "@/constants/platformConstants";
import { FORWARD_PATH } from "@/constants/routes";
import { EMPTY_SET } from "@/constants/constants";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { ToastUtils } from "@/utils/toastUtils";

import type { ConversationInfo, IMessage, TPickerState } from "@/types/chat/types";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { useFetchLastSeenMessageStatusForConversation } from "@/query/useFetchLastSeenMessageStatusForConversation";
import { useSetLastSeenMessageMutation } from "@/query/patch/queries";

import { useSendMessageHandler } from "@/hooks/conversation-thread/useSendMessageHandler";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";
import { useMessageAttachmentUploader } from "@/apis/photo-upload-service/photo-upload-service";

const CHAT_BG_OPACITY_DARK = 0.08;
const CHAT_BG_OPACITY_LIGHT = 0.02;

interface ConversationThreadScreenProps {
  conversationId: number;
  onShowProfile: () => void;
  webSearchPress?: () => void;
  webForwardPress?: (messageIds: Set<number>) => void;
  messageToJump?: number | null;
  onMessageJumped?: () => void;
}

const ConversationThreadScreen = ({
  conversationId,
  onShowProfile,
  webSearchPress = () => {},
  webForwardPress,
  onMessageJumped,
  messageToJump,
}: ConversationThreadScreenProps) => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const {
    user: { id: currentUserId },
  } = useUserStore();
  const queryClient = useQueryClient();

  const {
    selectionMode,
    setSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setSelectedConversationId,
    selectedConversationId,
  } = useConversationStore();
  const searchedMessageId = PLATFORM.IS_WEB ? messageToJump : Number(params.messageId);

  const currentConversationId = conversationId || Number(params.conversationId);

  useEffect(() => {
    if (currentConversationId) {
      setSelectedConversationId(currentConversationId);
    }
  }, [selectedConversationId]);

  const { conversationAPIResponse, conversationAPILoading, conversationAPIError } =
    useConversationByIdQuery(currentConversationId);

  const {
    conversationMessagesPages,
    isLoadingConversationMessages,
    conversationMessagesError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetchConversationMessages,
    loadMessageWindow,
    updateConversationMessagesCache,
  } = useConversationMessagesQuery(currentConversationId);

  const { updateConversation } = useConversationNotificationsContext();

  const { lastSeenMessageInfo } =
    useFetchLastSeenMessageStatusForConversation(currentConversationId);

  const { mutate: setLastSeenMessageForConversation } = useSetLastSeenMessageMutation(
    {
      conversationId: currentConversationId,
      currentUserId,
    },
    (data) => {
      updateConversation(currentConversationId, {
        unreadCount: data.unreadCount || 0,
      });
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  useEffect(() => {
    const messages = conversationMessagesPages?.pages?.flatMap((page) => page.content) ?? [];

    if (
      currentConversationId &&
      messages.length > 0 &&
      lastSeenMessageInfo?.lastSeenMessageId !== undefined
    ) {
      const firstMessage = messages[0];
      const isFirstMessageLastSeen = firstMessage.id === lastSeenMessageInfo.lastSeenMessageId;

      if (!isFirstMessageLastSeen) {
        setLastSeenMessageForConversation({
          messageId: firstMessage.id,
          conversationId: currentConversationId,
        });
      }
    }
  }, [currentConversationId, conversationMessagesPages, lastSeenMessageInfo]);

  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);
  const isGroupChat = conversationAPIResponse?.isGroup;

  useEffect(() => {
    if (searchedMessageId && loadMessageWindow) {
      void loadMessageWindow(searchedMessageId);
      onMessageJumped?.();
    }
  }, [searchedMessageId, loadMessageWindow, onMessageJumped]);

  const {
    selectedFiles,
    showImagePreview,
    imageMessage,
    setImageMessage,
    open: handleOpenImagePicker,
    close: handleCloseImagePreview,
    removeAt: handleRemoveFile,
    addMore: handleAddMoreFiles,
  } = useImagePreview();

  const {
    pickAndUploadImages,
    uploadFilesFromWeb,
    isUploading: isUploadingImages,
    error: uploadError,
  } = useMessageAttachmentUploader(currentConversationId, imageMessage);

  const handleOpenImagePickerNative = useCallback(async () => {
    try {
      const results = await pickAndUploadImages();
      if (results?.some((r) => r.success)) {
        setSelectedMessage(null);
        setImageMessage("");
      } else if (uploadError) {
        ToastUtils.error(uploadError);
      }
    } catch {
      ToastUtils.error("Failed to pick or upload images.");
    }
  }, [pickAndUploadImages, setSelectedMessage, setImageMessage, uploadError]);

  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessageMutation(
    undefined,
    (newMessage) => {
      setSelectedMessage(null);
      updateConversationMessagesCache(newMessage);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    (error) => ToastUtils.error(getAPIErrorMsg(error))
  );

  const { handleSendMessage, handleSendFiles } = useSendMessageHandler({
    currentConversationId,
    currentUserId,
    imageMessage,
    setImageMessage,
    selectedMessage,
    setSelectedMessage,
    selectedFiles,
    sendMessage,
    uploadFilesFromWeb,
    updateConversationMessagesCache,
    handleCloseImagePreview,
  });

  useEffect(() => {
    setSelectedMessage(null);
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
    handleCloseImagePreview();
  }, [currentConversationId, setSelectionMode, setSelectedMessageIds, handleCloseImagePreview]);

  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleMessageSelect = useCallback((message: IMessage) => {
    setSelectedMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  const onForwardPress = useCallback(() => {
    if (PLATFORM.IS_WEB) {
      webForwardPress?.(selectedMessageIds);
    } else {
      router.push({ pathname: FORWARD_PATH, params: {} });
    }
  }, [selectedMessageIds, webForwardPress]);

  const conversationMessages = useMemo(
    () => conversationMessagesPages?.pages?.flatMap((page) => page.content) ?? [],
    [conversationMessagesPages]
  );

  const conversationInfo: ConversationInfo = useMemo(
    () => ({
      conversationId: currentConversationId,
      conversationName: conversationAPIResponse?.name,
      signedImageUrl: conversationAPIResponse?.signedImageUrl,
    }),
    [currentConversationId, conversationAPIResponse]
  );

  const pickerState: TPickerState = useMemo(
    () => ({
      openPickerMessageId,
      setOpenPickerMessageId,
    }),
    [openPickerMessageId]
  );

  const renderContent = useCallback(() => {
    if (conversationAPILoading || isLoadingConversationMessages) {
      return <LoadingState />;
    }

    if (conversationAPIError || conversationMessagesError) {
      return (
        <Alert
          type="error"
          message={
            conversationMessagesError?.message ||
            conversationAPIError?.message ||
            "An error occurred"
          }
        />
      );
    }
    if (conversationMessages.length === 0) {
      return <EmptyChatState />;
    }
    return (
      <ConversationMessageList
        messages={conversationMessages}
        onLoadMore={handleLoadMore}
        isFetchingNextPage={isFetchingNextPage}
        onMessageSelect={handleMessageSelect}
        conversationAPIResponse={conversationAPIResponse}
        pickerState={pickerState}
        selectedConversationId={currentConversationId}
        targetMessageId={Number(searchedMessageId)}
      />
    );
  }, [
    conversationAPILoading,
    isLoadingConversationMessages,
    conversationAPIError,
    conversationMessagesError,
    conversationMessages,
    handleLoadMore,
    isFetchingNextPage,
    handleMessageSelect,
    conversationAPIResponse,
    pickerState,
    currentConversationId,
    searchedMessageId,
  ]);

  const renderTextInput = useCallback(() => {
    const isBlocked = conversationAPIResponse?.isBlocked === true;
    const isInactive = conversationAPIResponse?.isActive === false;

    if (isBlocked || isInactive) {
      return (
        <DisabledMessageInput
          customMessage={
            isInactive
              ? "You can't send messages to this group because you are no longer a member."
              : isBlocked
                ? "You can't send messages because this conversation is blocked."
                : undefined
          }
        />
      );
    }

    if (selectionMode) return null;

    return (
      <ConversationInputBar
        conversationId={currentConversationId}
        onSendMessage={handleSendMessage}
        onOpenImagePicker={handleOpenImagePicker}
        onOpenImagePickerNative={handleOpenImagePickerNative}
        disabled={isLoadingConversationMessages}
        isSending={isSendingMessage || isUploadingImages}
        replyToMessage={selectedMessage}
        onCancelReply={handleCancelReply}
        isGroupChat={isGroupChat}
      />
    );
  }, [
    conversationAPIResponse?.isBlocked,
    conversationAPIResponse?.isActive,
    selectionMode,
    currentConversationId,
    handleSendMessage,
    handleOpenImagePicker,
    handleOpenImagePickerNative,
    isLoadingConversationMessages,
    isSendingMessage,
    isUploadingImages,
    selectedMessage,
    handleCancelReply,
    isGroupChat,
  ]);

  const actionBarStyle = useMemo(
    () => ({
      paddingBottom: insets.bottom,
    }),
    [insets.bottom]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={PLATFORM.IS_ANDROID && { paddingBottom: insets.bottom }}
    >
      <ChatHeader
        conversationInfo={conversationInfo}
        onBackPress={handleBackPress}
        onShowProfile={onShowProfile}
        refetchConversationMessages={refetchConversationMessages}
        isLoadingConversationMessages={isLoadingConversationMessages}
        webPressSearch={webSearchPress}
      />

      <KeyboardAvoidingView className="flex-1" behavior="padding">
        <ImageBackground
          source={Images.chatBackground}
          className="flex-1"
          imageStyle={{
            opacity: isDark ? CHAT_BG_OPACITY_DARK : CHAT_BG_OPACITY_LIGHT,
          }}
        >
          <View className="flex-1">
            <View className="flex-1">
              {showImagePreview ? (
                <FilePreviewOverlay
                  files={selectedFiles}
                  onClose={handleCloseImagePreview}
                  onRemoveFile={handleRemoveFile}
                  onSendFiles={handleSendFiles}
                  onFileSelect={handleAddMoreFiles}
                  isSending={isSendingMessage}
                  message={imageMessage}
                  onMessageChange={setImageMessage}
                />
              ) : (
                <>
                  {renderContent()}
                  <View style={styles.textInputWrapper}>{renderTextInput()}</View>
                  {selectionMode && (
                    <View style={actionBarStyle}>
                      <MessageForwardActionBar
                        visible={selectionMode}
                        count={selectedMessageIds.size}
                        isDark={isDark}
                        onCancel={() => {
                          setSelectionMode(false);
                          setSelectedMessageIds(EMPTY_SET);
                        }}
                        onForward={onForwardPress}
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationThreadScreen;

const styles = StyleSheet.create({
  textInputWrapper: {
    paddingBottom: PLATFORM.IS_IOS ? undefined : 0,
  },
});
