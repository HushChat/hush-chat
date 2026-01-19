import {
  ConversationFilterCriteria,
  deleteConversationByID,
  removeConversationParticipant,
  ResetInviteLink,
  updateConversationParticipantRole,
} from "@/apis/conversation";
import { unblockUser } from "@/apis/user";
import { removeMessageReaction } from "@/apis/message";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { createMutationHook } from "@/query/config/createMutationFactory";

export const useDeleteConversationByIdMutation = createMutationHook<void, number>(
  deleteConversationByID,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][]
);

export const useRemoveMessageReactionMutation = createMutationHook<void, number>(
  removeMessageReaction
);

export const useUnblockUserMutation = createMutationHook<void, number>(
  unblockUser,
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId),
      conversationQueryKeys.participantProfileInfo(keyParams.userId, keyParams.conversationId),
    ] as string[][]
);

export const useRemoveConversationParticipantMutation = createMutationHook<
  void,
  { conversationId: number; participantId: number }
>(
  (params: { conversationId: number; participantId: number }) =>
    removeConversationParticipant(params.conversationId, params.participantId),
  (keyParams: { conversationId: number; participantId: number }) => () =>
    [
      conversationQueryKeys.ConversationParticipant(
        keyParams.conversationId,
        keyParams.participantId
      ),
    ] as string[][]
);

export const useUpdateConversationParticipantRoleMutation = createMutationHook<
  void,
  { conversationId: number; participantId: number; makeAdmin: boolean }
>(
  (params: { conversationId: number; participantId: number; makeAdmin: boolean }) =>
    updateConversationParticipantRole(
      params.conversationId,
      params.participantId,
      params.makeAdmin
    ),
  (keyParams: { conversationId: number; participantId: number }) => () =>
    [
      conversationQueryKeys.ConversationParticipant(
        keyParams.conversationId,
        keyParams.participantId
      ),
    ] as string[][]
);

export const useResetConversationInviteLinkMutation = createMutationHook<
  void,
  { conversationId: number }
>(
  (params: { conversationId: number }) => ResetInviteLink(params.conversationId),
  (keyParams: { conversationId: number }) => () =>
    [conversationQueryKeys.conversationInviteLink(keyParams.conversationId)] as string[][]
);
