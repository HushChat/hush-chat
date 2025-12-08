import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
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
import { MotionView } from "@/motion/MotionView";
import FavoriteMessages from "@/components/conversations/conversation-info-panel/FavoriteMessages";

interface OneToOneChatInfoProps {
  conversation: IConversation;
  onBack: () => void;
  setSelectedConversation: (conversation: null) => void;
}

export default function OneToOneChatInfo({
  conversation,
  onBack,
  setSelectedConversation,
}: OneToOneChatInfoProps) {
  const { openModal, closeModal } = useModalContext();
  const { conversationInfo, isLoadingConversationInfo, refetch } = useOneToOneConversationInfoQuery(
    conversation.id
  );
  const {
    user: { id: userId },
  } = useUserStore();

  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);

  const { activePanel, closePanel, openPanel, panelWidth, isPanelContentReady } =
    useWebPanelManager(screenWidth);

  const handleFavoriteMessages = () => {
    openPanel(PanelType.FAVORITE_MESSAGES);
  };

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

      <View style={styles.inner}>
        <View className="border border-[#E4E4E4] dark:border-[#E4E4E42B]" />
        <View>
          <ChatInfoCommonAction
            conversationId={conversation.id}
            isFavorite={conversationInfo?.favorite || false}
            isPinned={conversationInfo?.pinned || false}
            isMuted={!!conversationInfo?.mutedUntil}
            onBack={onBack}
            setSelectedConversation={setSelectedConversation}
            showFavoriteMessages={handleFavoriteMessages}
          />

          <ActionItem
            icon="ban-outline"
            label={`${conversationInfo?.blocked ? "Unblock" : "Block"} ${
              conversationInfo?.userView.firstName
            } ${conversationInfo?.userView.lastName}`}
            onPress={conversationInfo?.blocked ? handleUnblockUser : handleBlockUser}
            color="#EF4444"
          />
        </View>
      </View>
      {isPanelContentReady && activePanel === PanelType.FAVORITE_MESSAGES && (
        <MotionView
          visible={activePanel === PanelType.FAVORITE_MESSAGES}
          className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary-dark"
          from={{ translateX: panelWidth, opacity: 0 }}
          to={{ translateX: 0, opacity: 10 }}
        >
          <FavoriteMessages conversationId={conversation.id} onClose={closePanel} />
        </MotionView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: 16,
  },
});
