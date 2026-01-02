import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, KeyboardAvoidingView, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import ChatHeader from "@/components/conversations/conversation-thread/ChatHeader";
import ConversationMessageList from "@/components/conversations/conversation-thread/message-list/ConversationMessageList";
import EmptyChatState from "@/components/conversations/conversation-thread/message-list/EmptyChatState";
import LoadingState from "@/components/LoadingState";
import DisabledMessageInput from "@/components/conversations/conversation-thread/composer/DisabledMessageInput";
import FilePreviewOverlay, {
  FileWithCaption,
} from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewOverlay";
import MessageForwardActionBar from "@/components/conversations/conversation-thread/composer/MessageForwardActionBar";
import Alert from "@/components/Alert";

import { useConversationByIdQuery } from "@/query/useConversationByIdQuery";
import { useSendMessageMutation } from "@/query/post/queries";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useImagePreview } from "@/hooks/useImagePreview";

import { Images } from "@/assets/images";
import { PLATFORM } from "@/constants/platformConstants";
import { CHATS_PATH, FORWARD_PATH } from "@/constants/routes";
import { EMPTY_SET } from "@/constants/constants";
import { getAPIErrorMsg, navigateBackOrFallback } from "@/utils/commonUtils";
import { ToastUtils } from "@/utils/toastUtils";

import type { ConversationInfo, IMessage, TPickerState } from "@/types/chat/types";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { useFetchLastSeenMessageStatusForConversation } from "@/query/useFetchLastSeenMessageStatusForConversation";
import { useSetLastSeenMessageMutation } from "@/query/patch/queries";

import { useSendMessageHandler } from "@/hooks/conversation-thread/useSendMessageHandler";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";
import { useMessageAttachmentUploader } from "@/apis/photo-upload-service/photo-upload-service";
import ConversationInput from "@/components/conversation-input/ConversationInput";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import DragAndDropOverlay from "@/components/conversations/conversation-thread/message-list/file-upload/DragAndDropOverlay";
import { getAllTokens } from "@/utils/authUtils";
import { UserActivityWSSubscriptionData } from "@/types/ws/types";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useMessageEdit } from "@/hooks/useMessageEdit";

const CHAT_BG_OPACITY_DARK = 0.08;
const CHAT_BG_OPACITY_LIGHT = 0.02;

interface ConversationThreadScreenProps {
  conversationId: number;
  onShowProfile: () => void;
  webSearchPress?: () => void;
  webForwardPress?: (messageIds: Set<number>) => void;
  webMessageInfoPress?: (messageId: number) => void;
  messageToJump?: number | null;
  onMessageJumped?: () => void;
  onConversationDeleted?: () => void;
}

const ConversationThreadScreen = ({
  conversationId,
  onShowProfile,
  webSearchPress = () => {},
  webForwardPress,
  webMessageInfoPress,
  onMessageJumped,
  messageToJump,
}: ConversationThreadScreenProps) => {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const {
    user: { id: currentUserId, email },
  } = useUserStore();
  const queryClient = useQueryClient();
  const { publishActivity } = useWebSocket();

  const dropZoneRef = useRef<View>(null);

  const {
    selectionMode,
    setSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setSelectedConversationId,
    setIsMarkdownEnabled,
  } = useConversationStore();
  const searchedMessageId = PLATFORM.IS_WEB ? messageToJump : Number(params.messageId);
  const currentConversationId = conversationId || Number(params.conversationId);

  useEffect(() => {
    const publishUserActivity = async () => {
      const { workspace } = await getAllTokens();
      publishActivity({
        workspaceId: workspace as string,
        email,
        openedConversation: currentConversationId,
      } as UserActivityWSSubscriptionData);
    };

    if (currentConversationId) {
      setSelectedConversationId(currentConversationId);
      publishUserActivity();
    }
  }, [currentConversationId]);

  const { conversationAPIResponse, conversationAPILoading, conversationAPIError } =
    useConversationByIdQuery(currentConversationId);

  const {
    pages: conversationMessagesPages,
    isLoading: isLoadingConversationMessages,
    error: conversationMessagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    invalidateQuery: refetchConversationMessages,
    loadMessageWindow,
    updateConversationMessagesCache,
    targetMessageId,
    clearTargetMessage,
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
        unreadCount: data.data?.unreadCount || 0,
      });
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

      if (!firstMessage.id || typeof firstMessage.id !== "number") {
        return;
      }

      if (firstMessage.senderId === currentUserId) {
        return;
      }

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
  const isOnlyAdminsCanSendMessages =
    conversationAPIResponse?.isGroup && conversationAPIResponse?.onlyAdminsCanSendMessages;

  const isCurrentUserAdmin = conversationAPIResponse?.isCurrentUserAdmin;

  const { editingMessage, isEditingMessage, handleStartEdit, handleCancelEdit, handleEditMessage } =
    useMessageEdit({
      userId: Number(currentUserId),
      conversationId: currentConversationId,
    });

  const handleStartEditWithClearReply = useCallback(
    (message: IMessage) => {
      handleStartEdit(message);
      setSelectedMessage(null);
    },
    [handleStartEdit]
  );

  const handleNavigateToMessage = useCallback(
    (messageId: number) => {
      if (loadMessageWindow) {
        void loadMessageWindow(messageId);
        onMessageJumped?.();
      }
    },
    [loadMessageWindow, onMessageJumped]
  );

  useEffect(() => {
    if (searchedMessageId) {
      handleNavigateToMessage(searchedMessageId);
    }
  }, [searchedMessageId, handleNavigateToMessage]);

  const handleTargetMessageScrolled = useCallback(() => {
    clearTargetMessage();
  }, [clearTargetMessage]);

  const {
    selectedFiles,
    showImagePreview,
    open: handleOpenImagePicker,
    close: handleCloseImagePreview,
    removeAt: handleRemoveFile,
    addMore: handleAddMoreFiles,
  } = useImagePreview();

  const { isDragging } = useDragAndDrop(dropZoneRef, {
    onDropFiles: (files) => {
      if (selectedFiles.length === 0) {
        handleOpenImagePicker(files);
      } else {
        handleAddMoreFiles(files);
      }
    },
  });

  const {
    pickAndUploadImagesAndVideos,
    uploadFilesFromWebWithCaptions,
    pickAndUploadDocuments,
    isUploading: isUploadingImages,
    error: uploadError,
    sendGifMessage,
  } = useMessageAttachmentUploader(currentConversationId);

  const handleOpenDocumentPickerNative = useCallback(async () => {
    try {
      const results = await pickAndUploadDocuments();

      if (results?.some((r) => r.success)) {
        setSelectedMessage(null);
      } else if (uploadError) {
        ToastUtils.error(uploadError);
      }
    } catch {
      ToastUtils.error("Failed to pick or upload documents.");
    }
  }, [pickAndUploadDocuments, setSelectedMessage, uploadError]);

  const handleOpenImagePickerNative = useCallback(async () => {
    try {
      const results = await pickAndUploadImagesAndVideos();
      if (results?.some((r) => r.success)) {
        setSelectedMessage(null);
      } else if (uploadError) {
        ToastUtils.error(uploadError);
      }
    } catch {
      ToastUtils.error("Failed to pick or upload images.");
    }
  }, [pickAndUploadImagesAndVideos, setSelectedMessage, uploadError]);

  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessageMutation(
    undefined,
    (newMessage) => {
      setSelectedMessage(null);
      updateConversationMessagesCache(newMessage);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    (error) => ToastUtils.error(getAPIErrorMsg(error))
  );

  const { handleSendMessage, handleSendFilesWithCaptions } = useSendMessageHandler({
    currentConversationId,
    currentUserId,
    selectedMessage,
    setSelectedMessage,
    sendMessage,
    uploadFilesFromWebWithCaptions,
    handleCloseImagePreview,
    updateConversationMessagesCache,
    sendGifMessage,
  });

  const handleSendFilesFromPreview = useCallback(
    async (filesWithCaptions: FileWithCaption[]) => {
      await handleSendFilesWithCaptions(filesWithCaptions);
    },
    [handleSendFilesWithCaptions]
  );

  useEffect(() => {
    setSelectedMessage(null);
    handleCancelEdit();
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
    handleCloseImagePreview();
    setIsMarkdownEnabled(true);
  }, [
    currentConversationId,
    setSelectionMode,
    setSelectedMessageIds,
    handleCloseImagePreview,
    setIsMarkdownEnabled,
    handleCancelEdit,
  ]);

  const handleBackPress = useCallback(() => {
    navigateBackOrFallback(CHATS_PATH);
  }, []);

  const handleLoadOlder = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLoadNewer = useCallback(async () => {
    if (hasPreviousPage && !isFetchingPreviousPage) {
      await fetchPreviousPage();
    }
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

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
      router.push({
        pathname: FORWARD_PATH,
        params: { currentConversationId: currentConversationId },
      });
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
      chatUserStatus: conversationAPIResponse?.chatUserStatus,
      deviceType: conversationAPIResponse?.deviceType,
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
        onLoadMore={handleLoadOlder}
        onLoadNewer={handleLoadNewer}
        hasMoreNewer={hasPreviousPage}
        isFetchingNewer={isFetchingPreviousPage}
        isFetchingNextPage={isFetchingNextPage}
        onMessageSelect={handleMessageSelect}
        conversationAPIResponse={conversationAPIResponse}
        pickerState={pickerState}
        selectedConversationId={currentConversationId}
        setSelectedConversation={setSelectedConversationId}
        onNavigateToMessage={handleNavigateToMessage}
        targetMessageId={targetMessageId}
        onTargetMessageScrolled={handleTargetMessageScrolled}
        webMessageInfoPress={webMessageInfoPress}
        onEditMessage={handleStartEditWithClearReply}
      />
    );
  }, [
    conversationAPILoading,
    isLoadingConversationMessages,
    conversationAPIError,
    conversationMessagesError,
    conversationMessages,
    handleLoadOlder,
    handleLoadNewer,
    hasPreviousPage,
    isFetchingPreviousPage,
    isFetchingNextPage,
    handleMessageSelect,
    conversationAPIResponse,
    pickerState,
    currentConversationId,
    searchedMessageId,
    handleNavigateToMessage,
    targetMessageId,
    handleTargetMessageScrolled,
    handleStartEditWithClearReply,
  ]);

  const getDisabledMessageReason = useCallback(() => {
    const isBlocked = conversationAPIResponse?.isBlocked === true;
    const isInactive = conversationAPIResponse?.isActive === false;
    const isMessageRestricted = Boolean(isOnlyAdminsCanSendMessages) && !isCurrentUserAdmin;

    if (isInactive) {
      return "You can't send messages to this group because you are no longer a member.";
    }

    if (isBlocked) {
      return "You can't send messages because this conversation is blocked.";
    }

    if (isMessageRestricted) {
      return "Only admins are allowed to send messages in this group.";
    }

    return null;
  }, [
    conversationAPIResponse?.isBlocked,
    conversationAPIResponse?.isActive,
    isOnlyAdminsCanSendMessages,
    isCurrentUserAdmin,
  ]);

  const renderTextInput = useCallback(() => {
    const disabledReason = getDisabledMessageReason();

    if (disabledReason) {
      return <DisabledMessageInput customMessage={disabledReason} />;
    }

    if (selectionMode) return null;

    return (
      <ConversationInput
        conversationId={currentConversationId}
        onSendMessage={handleSendMessage}
        onOpenImagePicker={handleOpenImagePicker}
        onOpenImagePickerNative={handleOpenImagePickerNative}
        onOpenDocumentPickerNative={handleOpenDocumentPickerNative}
        disabled={isLoadingConversationMessages}
        isSending={isSendingMessage || isUploadingImages || isEditingMessage}
        replyToMessage={selectedMessage}
        onCancelReply={handleCancelReply}
        isGroupChat={isGroupChat}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
        onEditMessage={handleEditMessage}
      />
    );
  }, [
    conversationAPIResponse?.isBlocked,
    conversationAPIResponse?.isActive,
    isOnlyAdminsCanSendMessages,
    isCurrentUserAdmin,
    selectionMode,
    currentConversationId,
    handleSendMessage,
    handleOpenImagePicker,
    handleOpenImagePickerNative,
    handleOpenDocumentPickerNative,
    isLoadingConversationMessages,
    isSendingMessage,
    isUploadingImages,
    isEditingMessage,
    selectedMessage,
    handleCancelReply,
    isGroupChat,
    editingMessage,
    handleCancelEdit,
    handleEditMessage,
  ]);

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={PLATFORM.IS_ANDROID && { paddingBottom: insets.bottom }}
    >
      <View ref={dropZoneRef} className="flex-1 relative">
        <DragAndDropOverlay visible={isDragging} />
        <ChatHeader
          conversationInfo={conversationInfo}
          onBackPress={handleBackPress}
          onShowProfile={onShowProfile}
          refetchConversationMessages={refetchConversationMessages}
          isLoadingConversationMessages={isLoadingConversationMessages}
          webPressSearch={webSearchPress}
        />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={PLATFORM.IS_IOS ? "padding" : undefined}
          keyboardVerticalOffset={PLATFORM.IS_IOS ? 90 : 0}
        >
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
                    conversationId={currentConversationId}
                    onClose={handleCloseImagePreview}
                    onRemoveFile={handleRemoveFile}
                    onSendFiles={handleSendFilesFromPreview}
                    onFileSelect={handleAddMoreFiles}
                    isSending={isSendingMessage || isUploadingImages}
                    isGroupChat={isGroupChat}
                    replyToMessage={selectedMessage}
                    onCancelReply={handleCancelReply}
                  />
                ) : (
                  <>
                    {renderContent()}
                    <View style={styles.textInputWrapper}>{renderTextInput()}</View>
                    {selectionMode && (
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
                    )}
                  </>
                )}
              </View>
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default ConversationThreadScreen;

const styles = StyleSheet.create({
  textInputWrapper: {
    paddingBottom: PLATFORM.IS_IOS ? undefined : 0,
  },
});
