import { useCallback, useEffect, useState } from "react";
import { TITLES } from "@/constants/constants";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { useToggleMuteConversationMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { getCriteria } from "@/utils/conversationUtils";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";

const MUTE_OPTIONS = [
  { label: "15 mins", value: "15m" },
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "Always", value: "always" },
];

export function useToggleMuteConversation(
  conversationId: number,
  initialMuted: boolean,
  onBeforeModal?: () => void
) {
  const [isMutedState, setIsMutedState] = useState(initialMuted);
  const { openModal, closeModal } = useModalContext();
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);

  const toggleMuteConversation = useToggleMuteConversationMutation(
    { userId: Number(userId), criteria },
    () => setIsMutedState(!isMutedState),
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  useEffect(() => {
    setIsMutedState(initialMuted);
  }, [initialMuted]);

  const performMuteMutation = useCallback(
    (payload: { conversationId: number; duration: string | null }) =>
      toggleMuteConversation.mutate(payload, {
        onSuccess: () => setIsMutedState(payload.duration !== null),
        onError: (error) => ToastUtils.error(getAPIErrorMsg(error)),
      }),
    [toggleMuteConversation]
  );

  const handleToggleMute = useCallback(() => {
    onBeforeModal?.();

    if (isMutedState) {
      performMuteMutation({ conversationId, duration: null });
      return;
    }

    openModal({
      type: MODAL_TYPES.confirm,
      title: TITLES.MUTE_CONVERSATION,
      description: "Select how long you want to mute this conversation",
      buttons: [
        ...MUTE_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            performMuteMutation({ conversationId, duration: option.value });
            closeModal();
          },
        })),
        {
          text: "Cancel",
          onPress: closeModal,
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "volume-off-outline",
    });
  }, [isMutedState, onBeforeModal, openModal, closeModal, performMuteMutation, conversationId]);

  return { isMutedState, handleToggleMute };
}
