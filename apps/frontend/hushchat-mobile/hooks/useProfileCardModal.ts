import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { TUser } from "@/types/user/types";
import { ConversationParticipant } from "@/types/chat/types";
import { createOneToOneConversation } from "@/apis/conversation";
import { CONVERSATION } from "@/constants/routes";
import { ToastUtils } from "@/utils/toastUtils";
import { useUserStore } from "@/store/user/useUserStore";

export function useProfileCardModal() {
  const router = useRouter();
  const currentUserId = String(useUserStore.getState().user.id);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);

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

  const openProfileCard = useCallback(
    (user: TUser) => {
      if (String(user.id) === currentUserId) return;
      setSelectedUser(user);
      setShowProfileModal(true);
    },
    [currentUserId]
  );

  const openProfileCardFromParticipant = useCallback(
    (participant: ConversationParticipant) => {
      openProfileCard(participant.user);
    },
    [openProfileCard]
  );

  const closeProfileCard = useCallback(() => {
    setShowProfileModal(false);
    setSelectedUser(null);
  }, []);

  const handleMessagePress = useCallback(() => {
    if (!selectedUser || String(selectedUser.id) === currentUserId) return;
    setShowProfileModal(false);
    createConversation(selectedUser.id);
  }, [selectedUser, currentUserId, createConversation]);

  const profileCardData = selectedUser
    ? {
        name: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
        imageUrl: selectedUser.signedImageUrl,
        username: selectedUser.username,
        isGroup: false as const,
      }
    : null;

  return {
    showProfileModal,
    selectedUser,
    profileCardData,
    openProfileCard,
    openProfileCardFromParticipant,
    closeProfileCard,
    handleMessagePress,
  };
}
