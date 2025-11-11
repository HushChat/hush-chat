import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageBackground, KeyboardAvoidingView, View } from "react-native";
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

import { format } from "date-fns";
import { useMessageAttachmentUploader } from "@/apis/photo-upload-service/photo-upload-service";
import Alert from "@/components/Alert";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { useUserStore } from "@/store/user/useUserStore";

const CHAT_BG_OPACITY_DARK = 0.08;
const CHAT_BG_OPACITY_LIGHT = 0.02;

interface ConversationThreadScreenProps {
  conversationId: number;
  onShowProfile: () => void;
  webBackPress?: () => void;
  webSearchPress?: () => void;
  webForwardPress?: (messageIds: Set<number>) => void;
  messageToJump?: number | null;
  onMessageJumped?: () => void;
}

const ConversationThreadScreen = ({
  conversationId,
  webBackPress,
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

  const selectedConversationId = conversationId || Number(params.conversationId);

  const { selectionMode, setSelectionMode, selectedMessageIds, setSelectedMessageIds } =
    useConversationStore();

  const { conversationAPIResponse, conversationAPILoading, conversationAPIError } =
    useConversationByIdQuery(selectedConversationId);

  const isGroupChat = conversationAPIResponse?.isGroup;

  const {
    conversationMessagesPages,
    isLoadingConversationMessages,
    conversationMessagesError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetchConversationMessages,
    jumpToMessage,
    updateConversationMessagesCache,
    hasPreviousPage,
    fetchPreviousPage,
    isFetchingPreviousPage,
  } = useConversationMessagesQuery(selectedConversationId);

  const [selectedMessage, setSelectedMessage] = useState<IMessage | null>(null);
  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);

  const searchedMessage = PLATFORM.IS_WEB ? messageToJump : Number(params.messageId);

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

  const jumpBlockRef = useRef(false);

  useEffect(() => {
    if (searchedMessage && jumpToMessage) {
      jumpBlockRef.current = true;
      void jumpToMessage(searchedMessage);
      onMessageJumped?.();

      setTimeout(() => {
        jumpBlockRef.current = false;
      }, 1500);
    }
  }, [searchedMessage, jumpToMessage, onMessageJumped]);


  const {
    pickAndUploadImages,
    uploadFilesFromWeb,
    isUploading: isUploadingImages,
    error: uploadError,
  } = useMessageAttachmentUploader(selectedConversationId, imageMessage);

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
  }, [
    pickAndUploadImages,
    refetchConversationMessages,
    setSelectedMessage,
    setImageMessage,
    uploadError,
  ]);

  const queryClient = useQueryClient();

  const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessageMutation(
    undefined,
    (newMessage) => {
      setSelectedMessage(null);

      updateConversationMessagesCache(newMessage);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    (error) => ToastUtils.error(getAPIErrorMsg(error))
  );

  useEffect(() => {
    setSelectedMessage(null);
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
    handleCloseImagePreview();
  }, [selectedConversationId, setSelectionMode, setSelectedMessageIds, handleCloseImagePreview]);

  const handleBackPress = useCallback(() => {
    if (webBackPress) {
      webBackPress();
    } else {
      router.replace("/");
    }
  }, [webBackPress]);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLoadNewer = useCallback(async () => {
    if (jumpBlockRef.current) return;

    if (!hasPreviousPage || isFetchingPreviousPage) return;
    await fetchPreviousPage();
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  const handleMessageSelect = useCallback((message: IMessage) => {
    setSelectedMessage(message);
  }, []);

  const handleCancelReply = useCallback(() => {
    setSelectedMessage(null);
  }, []);

  const handleSendMessage = useCallback(
    async (message: string, parentMessage?: IMessage, files?: File[]) => {
      const messageToSend = message;
      const filesToSend = files || [];
      if ((!messageToSend.trim() && filesToSend.length === 0) || isSendingMessage) return;

      const validFiles = filesToSend.filter((f) => f instanceof File);
      const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "svg"];

      try {
        if (validFiles.length > 0) {
          const renamedFiles = validFiles.map((file, index) => {
            const timestamp = format(new Date(), "yyyy-MM-dd HH-mm-ss");
            const fileExtension = file.name.split(".").pop() || "";
            const isImage = IMAGE_EXTENSIONS.includes(fileExtension);
            const newFileName = isImage
              ? `ChatApp Image ${selectedConversationId}${index} ${timestamp}.${fileExtension}`
              : file.name;

            return new File([file], newFileName, {
              type: file.type,
              lastModified: file.lastModified,
            });
          });

          const newMessage: IMessage = {
            senderId: Number(currentUserId),
            senderFirstName: useUserStore.getState().user.firstName,
            senderLastName: useUserStore.getState().user.lastName,
            messageText: imageMessage || "",
            createdAt: new Date().toISOString(),
            conversationId: selectedConversationId,
            messageAttachments: renamedFiles.map((file) => ({
              fileUrl: URL.createObjectURL(file),
              originalFileName: file.name,
              indexedFileName: '',
              mimeType: file.type
            }))
          };

          updateConversationMessagesCache(newMessage);
          await uploadFilesFromWeb(renamedFiles);
          setSelectedMessage(null);
          setImageMessage("");
        } else {
          sendMessage({
            conversationId: selectedConversationId,
            message: messageToSend,
            parentMessageId: parentMessage?.id,
          });
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [
      isSendingMessage,
      selectedConversationId,
      sendMessage,
      uploadFilesFromWeb,
      updateConversationMessagesCache,
      currentUserId,
      imageMessage,
    ]
  );

  const handleSendFiles = useCallback(() => {
    if (!selectedFiles.length) return;

    void handleSendMessage(imageMessage, selectedMessage ?? undefined, selectedFiles);

    handleCloseImagePreview();
    setImageMessage("");

    if (selectedMessage) setSelectedMessage(null);
  }, [
    selectedFiles,
    imageMessage,
    selectedMessage,
    handleSendMessage,
    handleCloseImagePreview,
    setImageMessage,
  ]);

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
      conversationId: selectedConversationId,
      conversationName: conversationAPIResponse?.name,
      signedImageUrl: conversationAPIResponse?.signedImageUrl,
    }),
    [selectedConversationId, conversationAPIResponse?.name, conversationAPIResponse?.signedImageUrl]
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
        onEndReached={handleLoadNewer}
        onMessageSelect={handleMessageSelect}
        conversationAPIResponse={conversationAPIResponse}
        pickerState={pickerState}
        selectedConversationId={selectedConversationId}
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
    selectedConversationId,
    handleLoadNewer,
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
        conversationId={selectedConversationId}
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
    selectedConversationId,
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

      <KeyboardAvoidingView className="flex-1" behavior={PLATFORM.IS_IOS ? "padding" : "height"}>
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
                  {renderTextInput()}
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
    </SafeAreaView>
  );
};

export default ConversationThreadScreen;
