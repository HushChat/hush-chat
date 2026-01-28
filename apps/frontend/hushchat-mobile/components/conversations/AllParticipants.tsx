import React, { useMemo } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { ParticipantRow } from "@/components/conversations/ParticipantsRow";
import { Ionicons } from "@expo/vector-icons";
import { useConversationParticipantQuery } from "@/query/useConversationParticipantQuery";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { PaginatedResponse } from "@/types/common/types";
import { ConversationParticipant } from "@/types/chat/types";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { ToastUtils } from "@/utils/toastUtils";
import { useGroupConversationInfoQuery } from "@/query/useGroupConversationInfoQuery";
import {
  useRemoveConversationParticipantMutation,
  useUpdateConversationParticipantRoleMutation,
} from "@/query/delete/queries";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";

interface AllParticipantsProps {
  conversationId: number;
  visible: boolean;
  onClose: () => void;
}

export const AllParticipants = ({ conversationId, visible, onClose }: AllParticipantsProps) => {
  const screenWidth = Dimensions.get("window").width;
  const updateCache = useUpdateCache();

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversationParticipantQuery(conversationId);

  const allParticipants = useMemo(
    () => pages?.pages?.flatMap((page) => (page.content as ConversationParticipant[]) || []) || [],
    [pages]
  );

  const { openModal, closeModal } = useModalContext();
  const { conversationInfo } = useGroupConversationInfoQuery(conversationId);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const [removeParticipantId, setRemoveParticipantId] = React.useState<number | null>(null);

  const removeParticipant = (participantId: number) => {
    setRemoveParticipantId(participantId);
    openModal({
      type: MODAL_TYPES.confirm,
      title: "Remove Participant",
      description: "Are you sure you want to remove this participant from the conversation?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Remove",
          onPress: () =>
            handleRemoveParticipant.mutate({
              conversationId,
              participantId,
            }),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "exit-outline",
    });
  };

  const handleRemoveParticipant = useRemoveConversationParticipantMutation(
    undefined,
    async () => {
      closeModal();
      ToastUtils.success("Participant removed successfully!");

      updateCache(
        conversationQueryKeys.ConversationParticipants(conversationId, ""),
        (prev: { pages: PaginatedResponse<ConversationParticipant>[] } | undefined) => {
          if (!prev) return prev;

          return {
            ...prev,
            pages: prev.pages.map((page, index) => {
              const newContent = page.content.filter(
                (participant) => participant.id !== removeParticipantId
              );

              if (index === 0) {
                return {
                  ...page,
                  content: newContent,
                  totalElements: (page.totalElements || 0) - 1,
                };
              }

              return {
                ...page,
                content: newContent,
              };
            }),
          };
        }
      );
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || "Failed to remove participant.");
    }
  );

  const [updateRoleId, setUpdateRoleId] = React.useState<number | null>(null);
  const [updateRoleAdminStatus, setUpdateRoleAdminStatus] = React.useState<boolean>(false);

  const updateConversationParticipantRole = (participantId: number, makeAdmin: boolean) => {
    setUpdateRoleId(participantId);
    setUpdateRoleAdminStatus(makeAdmin);
    openModal({
      type: MODAL_TYPES.confirm,
      title: "Update Participant Role",
      description: "Are you sure you want to update this participant's role?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Update",
          variant: MODAL_BUTTON_VARIANTS.primary,
          onPress: () =>
            handleUpdateConversationParticipantRole.mutate({
              conversationId,
              participantId,
              makeAdmin,
            }),
        },
      ],
      icon: "shield-checkmark-outline",
    });
  };

  const handleUpdateConversationParticipantRole = useUpdateConversationParticipantRoleMutation(
    { conversationId },
    async () => {
      closeModal();
      ToastUtils.success("Participant role updated successfully!");

      updateCache(
        conversationQueryKeys.ConversationParticipants(conversationId, ""),
        (prev: { pages: PaginatedResponse<ConversationParticipant>[] } | undefined) => {
          if (!prev) return prev;

          return {
            ...prev,
            pages: prev.pages.map((page) => ({
              ...page,
              content: page.content.map((participant) =>
                participant.user.id === updateRoleId
                  ? {
                      ...participant,
                      role: (updateRoleAdminStatus
                        ? "ADMIN"
                        : "MEMBER") as ConversationParticipant["role"],
                    }
                  : participant
              ),
            })),
          };
        }
      );
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || "Failed to update participant role.");
    }
  );

  return (
    <MotionView
      visible={visible}
      className="absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary-dark"
      from={{ translateX: screenWidth, opacity: 0 }}
      to={{ translateX: 0, opacity: 1 }}
    >
      <View className="flex-row justify-between items-center px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-background-light dark:bg-background-dark">
        <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
          All Participants
        </AppText>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close-outline" size={22} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={allParticipants}
        renderItem={({ item }) => (
          <ParticipantRow
            participant={item}
            showMenu={conversationInfo?.admin}
            onRemove={removeParticipant}
            onToggleRole={updateConversationParticipantRole}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading || isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator
        className="flex-1 bg-background-light dark:bg-background-dark custom-scrollbar"
        contentContainerStyle={styles.listContentContainer}
      />
    </MotionView>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 40,
  },
});
