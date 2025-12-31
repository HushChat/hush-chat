import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import ChatInfoHeader from "@/components/conversations/conversation-info-panel/common/ChatInfoHeader";
import ActionItem from "@/components/conversations/conversation-info-panel/common/ActionItem";
import { useModalContext } from "@/context/modal-context";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { router } from "expo-router";
import { CHAT_VIEW_PATH, SEARCH_VIEW_PATH } from "@/constants/routes";
import { IConversation } from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import ChatInfoCommonAction from "@/components/conversations/conversation-info-panel/common/ChatInfoCommonAction";
import LoadingState from "@/components/LoadingState";
import { useOneToOneConversationInfoQuery } from "@/query/useOneToOneConversationInfoQuery";
import { useBlockUserMutation } from "@/query/post/queries";
import { useUnblockUserMutation } from "@/query/delete/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { PanelType } from "@/types/web-panel/types";
import useWebPanelManager from "@/hooks/useWebPanelManager";
import CommonGroupsView from "@/components/conversations/conversation-info-panel/CommonGroupsView";

interface OneToOneChatInfoProps {
  conversation: IConversation;
  onBack: () => void;
  setSelectedConversation: (conversation: IConversation | null) => void;
  onShowMediaAttachments: () => void;
}

export default function OneToOneChatInfo({
  conversation,
  onBack,
  setSelectedConversation,
  onShowMediaAttachments,
}: OneToOneChatInfoProps) {
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);
  const { openModal, closeModal } = useModalContext();
  const { conversationInfo, isLoadingConversationInfo, refetch } = useOneToOneConversationInfoQuery(
    conversation.id
  );
  const {
    user: { id: userId },
  } = useUserStore();

  const { activePanel, isPanelContentReady, openPanel, closePanel } =
    useWebPanelManager(screenWidth);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  const blockUserMutation = useBlockUserMutation(
    { userId: Number(userId), conversationId: conversation.id },
    () => {
      ToastUtils.success(
        `Blocked ${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`
      );
      refetch();
      closeModal();
    },
    (error) => ToastUtils.error(getAPIErrorMsg(error))
  );

  const unblockUserMutation = useUnblockUserMutation(
    { userId: Number(userId), conversationId: conversation.id },
    () => {
      ToastUtils.success(
        `Unblocked ${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`
      );
      refetch();
      closeModal();
    },
    (error) => ToastUtils.error(getAPIErrorMsg(error))
  );

  const handleShowCommonGroups = () => {
    openPanel(PanelType.COMMON_GROUP);
  };

  const handleBlockUser = () => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: `Block ${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`,
      description: "Are you sure you want to block this user?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Block",
          onPress: () => blockUserMutation.mutate(conversationInfo?.userView.id || 0),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "ban",
    });
  };

  const handleUnblockUser = () => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: `Unblock ${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`,
      description: "Are you sure you want to unblock this user?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Unblock",
          onPress: () => unblockUserMutation.mutate(conversationInfo?.userView.id || 0),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "ban",
    });
  };

  if (isLoadingConversationInfo) return <LoadingState />;

  return (
    <View style={styles.container}>
      <ChatInfoHeader
        title={`${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`}
        onBack={onBack}
        showActions
        onPressChat={() =>
          router.push({
            pathname: CHAT_VIEW_PATH,
            params: {
              conversationId: String(conversation.id),
              conversationName: `${conversationInfo?.userView.firstName} ${conversationInfo?.userView.lastName}`,
            },
          })
        }
        imageUrl={conversationInfo?.userView.signedImageUrl || ""}
        onPressSearch={() =>
          router.push({
            pathname: SEARCH_VIEW_PATH,
            params: {
              conversationId: String(conversation.id),
              conversationName: conversation.name,
              isSearchModeOn: "true",
            },
          })
        }
      />

      <View className="border border-[#E4E4E4] dark:border-[#E4E4E42B]" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        className="custom-scrollbar"
      >
        <ChatInfoCommonAction
          conversationId={conversation.id}
          isFavorite={conversationInfo?.favorite || false}
          isPinned={conversationInfo?.pinned || false}
          isMuted={!!conversationInfo?.mutedUntil}
          onBack={onBack}
          setSelectedConversation={setSelectedConversation}
          onShowMediaAttachments={onShowMediaAttachments}
          onSelectCommonGroups={handleShowCommonGroups}
        />
        <ActionItem
          icon="ban-outline"
          label={`${conversationInfo?.blocked ? "Unblock" : "Block"} ${
            conversationInfo?.userView.firstName
          } ${conversationInfo?.userView.lastName}`}
          onPress={conversationInfo?.blocked ? handleUnblockUser : handleBlockUser}
          color="#EF4444"
        />
      </ScrollView>

      {isPanelContentReady && activePanel === PanelType.COMMON_GROUP && (
        <CommonGroupsView
          conversationId={conversation.id}
          onClose={closePanel}
          visible={activePanel === PanelType.COMMON_GROUP}
          setSelectedConversation={setSelectedConversation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
});
