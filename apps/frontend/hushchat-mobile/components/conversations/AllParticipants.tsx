import React, { useCallback, useMemo, useState } from "react";
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
import ProfileCardModal from "@/components/ProfileCardModal";
import { TUser } from "@/types/user/types";
import { useUserStore } from "@/store/user/useUserStore";
import { createOneToOneConversation } from "@/apis/conversation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { CONVERSATION } from "@/constants/routes";

interface AllParticipantsProps {
  conversationId: number;
  visible: boolean;
  onClose: () => void;
}

export const AllParticipants = ({ conversationId, visible, onClose }: AllParticipantsProps) => {
  const screenWidth = Dimensions.get("window").width;
  const router = useRouter();
  const currentUserId = useUserStore.getState().user.id;

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
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

  const removeParticipant = (participantId: number) => {
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
    { conversationId },
    async () => {
      closeModal();
      ToastUtils.success("Participant removed successfully!");
      await refetch();
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || "Failed to remove participant.");
    }
  );

  const updateConversationParticipantRole = (participantId: number, makeAdmin: boolean) => {
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
      await refetch();
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || "Failed to update participant role.");
    }
  );

  const handleAvatarPress = useCallback(
    (participant: ConversationParticipant) => {
      if (String(participant.user.id) === String(currentUserId)) return;
      setSelectedUser(participant.user);
      setShowProfileModal(true);
    },
    [currentUserId]
  );

  const { mutate: createConversation } = useMutation({
    mutationFn: (targetUserId: number) => createOneToOneConversation(targetUserId),
    onSuccess: (result) => {
      if (result.data) {
        router.push(CONVERSATION(result.data.id));
      } else if (result.error) {
        ToastUtils.error(result.error);
      }
    },
  });

  const handleMessagePress = useCallback(() => {
    if (!selectedUser || String(selectedUser.id) === String(currentUserId)) return;
    setShowProfileModal(false);
    createConversation(selectedUser.id);
  }, [selectedUser, currentUserId, createConversation]);

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
            onAvatarPress={handleAvatarPress}
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
      {selectedUser && (
        <ProfileCardModal
          visible={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUser(null);
          }}
          data={{
            name: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
            imageUrl: selectedUser.signedImageUrl,
            username: selectedUser.username,
            isGroup: false,
          }}
          onMessagePress={handleMessagePress}
        />
      )}
    </MotionView>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 40,
  },
});
