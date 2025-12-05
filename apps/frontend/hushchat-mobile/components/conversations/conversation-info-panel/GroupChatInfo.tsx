import React, { useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from "react-native";
import ChatInfoHeader from "@/components/conversations/conversation-info-panel/common/ChatInfoHeader";
import ActionItem from "@/components/conversations/conversation-info-panel/common/ActionItem";
import { router } from "expo-router";
import { CHAT_VIEW_PATH, SEARCH_VIEW_PATH } from "@/constants/routes";
import { ConversationParticipant, IConversation } from "@/types/chat/types";
import { useGroupConversationInfoQuery } from "@/query/useGroupConversationInfoQuery";
import ChatInfoCommonAction from "@/components/conversations/conversation-info-panel/common/ChatInfoCommonAction";
import { ToastUtils } from "@/utils/toastUtils";
import { useModalContext } from "@/context/modal-context";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { AllParticipants } from "@/components/conversations/AllParticipants";
import { ParticipantRow } from "@/components/conversations/ParticipantsRow";
import { PanelType } from "@/types/web-panel/types";
import useWebPanelManager from "@/hooks/useWebPanelManager";
import GroupSettings from "@/components/conversations/conversation-info-panel/GroupSettings";
import LoadingState from "@/components/LoadingState";
import { useConversationParticipantQuery } from "@/query/useConversationParticipantQuery";
import AddMoreGroupParticipants from "@/components/conversations/conversation-info-panel/AddMoreGroupParticipants";
import { useUserStore } from "@/store/user/useUserStore";
import {
  useExitGroupConversationMutation,
  useReportConversationMutation,
} from "@/query/post/queries";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import FavoriteMessages from "@/components/conversations/conversation-info-panel/FavoriteMessages";

const COLORS = {
  button: "#3b82f6",
};

interface GroupChatInfoProps {
  conversation: IConversation;
  onBack: () => void;
  setSelectedConversation: (conversation: null) => void;
}

export default function GroupChatInfo({
  conversation,
  onBack,
  setSelectedConversation,
}: GroupChatInfoProps) {
  const { openModal, closeModal } = useModalContext();

  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);
  const [allParticipants, setAllParticipants] = useState<ConversationParticipant[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { conversationInfo, isLoadingConversationInfo, refetch } = useGroupConversationInfoQuery(
    conversation.id
  );

  const {
    user: { id: userId },
  } = useUserStore();

  const { pages: participantsPages, error: participantsError } = useConversationParticipantQuery(
    conversation.id
  );

  const { panelWidth, activePanel, isPanelContentReady, openPanel, closePanel } =
    useWebPanelManager(screenWidth);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    setAllParticipants([]);
    setTotalCount(0);
  }, [conversation.id]);

  useEffect(() => {
    if (participantsPages?.pages?.length) {
      const firstPage = participantsPages.pages[0];
      const participantsList = (firstPage.content as ConversationParticipant[]) || [];
      setAllParticipants(participantsList.slice(0, 3));
      const total = firstPage.totalElements || firstPage.total || participantsList.length;
      setTotalCount(total);
    }
  }, [participantsPages]);

  const handleShowAllParticipants = () => {
    openPanel(PanelType.PARTICIPANTS);
  };

  const handleGroupSettings = () => {
    openPanel(PanelType.GROUP_SETTINGS);
  };

  const handleAddMoreParticipants = () => {
    openPanel(PanelType.ADD_PARTICIPANTS);
  };

  const handleFavoriteMessages = () => {
    openPanel(PanelType.FAVORITE_MESSAGES);
  };

  const exitGroupMutation = useExitGroupConversationMutation(
    { userId: Number(userId), conversationId: conversation.id },
    () => {
      ToastUtils.success(`You have exited the group: ${conversation.name}`);
      refetch();
      closeModal();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const reportConversationMutation = useReportConversationMutation(
    undefined,
    () => {
      ToastUtils.success(`Group ${conversation.name} reported successfully`);
      closeModal();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleExitGroup = () =>
    openModal({
      type: MODAL_TYPES.confirm,
      title: "Exit Group",
      description: "Are you sure you want to exit? You won't be able to see new messages.",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Exit Group",
          onPress: () => exitGroupMutation.mutate(conversation.id),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "exit-outline",
    });

  const handleReportGroup = () =>
    openModal({
      type: MODAL_TYPES.info,
      title: "Report Group",
      description: "What would you like to report about this group?",
      buttons: [
        { text: "Cancel", onPress: closeModal, className: "w-full" },
        {
          text: "Spam",
          onPress: () => {
            reportConversationMutation.mutate({
              conversationId: conversation.id,
              reason: "SPAM",
            });
          },
          className: "w-full",
        },
        {
          text: "Inappropriate Content",
          onPress: () => {
            reportConversationMutation.mutate({
              conversationId: conversation.id,
              reason: "INAPPROPRIATE_CONTENT",
            });
          },
          className: "w-full",
        },
        {
          text: "Other",
          onPress: () => {
            reportConversationMutation.mutate({
              conversationId: conversation.id,
              reason: "OTHER",
            });
          },
          className: "w-full",
        },
      ],
      icon: "flag",
    });

  if (isLoadingConversationInfo) {
    return <LoadingState />;
  }

  if (participantsError) {
    return (
      <View style={styles.flex1}>
        <ChatInfoHeader
          title={conversationInfo?.conversation.name ?? ""}
          onBack={onBack}
          showActions
          onPressChat={() =>
            router.push({
              pathname: CHAT_VIEW_PATH,
              params: {
                conversationId: String(conversation.id),
                conversationName: conversation.name,
              },
            })
          }
          imageUrl={conversationInfo?.conversation.signedImageUrl || ""}
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
        <View className="flex-1 justify-center items-center px-4">
          <AppText className="text-red-500 text-center text-lg mb-2">
            Failed to load participants
          </AppText>
          <AppText className="text-gray-500 text-center">
            {participantsError?.message || "Unknown error occurred"}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <ChatInfoHeader
        title={conversation.name ?? ""}
        onBack={onBack}
        showActions
        onPressChat={() =>
          router.push({
            pathname: CHAT_VIEW_PATH,
            params: {
              conversationId: String(conversation.id),
              conversationName: conversation.name,
            },
          })
        }
        imageUrl={conversation.signedImageUrl || ""}
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

      <ScrollView
        style={styles.flex1}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        className="custom-scrollbar"
      >
        {/* Participants Preview */}
        <View style={styles.participantsSection}>
          <View className="flex-row items-center mb-3">
            <AppText className="text-lg font-semibold text-gray-900 dark:text-white">
              Participants
            </AppText>

            <View className="ml-auto">
              <AppText className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} {totalCount === 1 ? "member" : "members"}
              </AppText>
            </View>
          </View>

          <View>
            {allParticipants.map((participant) => (
              <ParticipantRow key={participant.id.toString()} participant={participant} />
            ))}
          </View>
          <Pressable
            onPress={handleShowAllParticipants}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "rgba(59,130,246,0.1)" : "transparent",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignSelf: "center",
            })}
          >
            <AppText style={styles.seeAllButton}>See All Participants</AppText>
          </Pressable>
        </View>

        {/* Action Items */}
        <View style={styles.actionSection}>
          {conversationInfo?.active ? (
            <View>
              {conversationInfo.admin && (
                <>
                  <ActionItem
                    icon="person-add-outline"
                    label="Add Participants"
                    onPress={handleAddMoreParticipants}
                  />
                  <ActionItem
                    icon="settings-outline"
                    label="Group Settings"
                    onPress={handleGroupSettings}
                  />
                </>
              )}
              <ChatInfoCommonAction
                conversationId={conversation.id}
                isFavorite={conversationInfo?.favorite || false}
                isPinned={conversationInfo?.pinned || false}
                isMuted={conversationInfo?.mutedUntil ? true : false}
                onBack={onBack}
                setSelectedConversation={setSelectedConversation}
                showFavoriteMessages={handleFavoriteMessages}
              />
              <ActionItem
                icon="exit-outline"
                label="Exit Group"
                onPress={handleExitGroup}
                color="#F59E0B"
              />
            </View>
          ) : (
            <AppText className="text-center text-gray-500 dark:text-gray-400 my-4">
              You have exited this group. You will not receive new messages.
            </AppText>
          )}
          <ActionItem
            icon="flag-outline"
            label="Report Group"
            onPress={handleReportGroup}
            color="#EF4444"
          />
        </View>
      </ScrollView>

      {isPanelContentReady && activePanel === PanelType.PARTICIPANTS && (
        <AllParticipants
          conversationId={conversation.id}
          onClose={closePanel}
          visible={activePanel === PanelType.PARTICIPANTS}
          panelWidth={panelWidth}
        />
      )}

      {isPanelContentReady && activePanel === PanelType.ADD_PARTICIPANTS && (
        <AddMoreGroupParticipants
          conversationId={conversation.id}
          onClose={closePanel}
          visible={activePanel === PanelType.ADD_PARTICIPANTS}
        />
      )}

      {isPanelContentReady && activePanel === PanelType.GROUP_SETTINGS && (
        <View className="absolute inset-0 bg-background-light dark:bg-background-dark">
          <GroupSettings
            conversation={conversation}
            onClose={closePanel}
            visible={activePanel === PanelType.GROUP_SETTINGS}
          />
        </View>
      )}

      {isPanelContentReady && activePanel === PanelType.FAVORITE_MESSAGES && (
        <MotionView
          visible={activePanel === PanelType.FAVORITE_MESSAGES}
          className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary-dark"
          from={{ translateX: panelWidth, opacity: 0 }}
          to={{ translateX: 0, opacity: 1 }}
        >
          <FavoriteMessages conversationId={conversation.id} onClose={closePanel} />
        </MotionView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  participantsSection: {
    marginTop: 16,
  },
  actionSection: {
    marginTop: 24,
  },
  seeAllButton: {
    color: COLORS.button,
    fontWeight: "500",
    textAlign: "center",
  },
});
