import {
  archiveConversationById,
  ConversationFilterCriteria,
  setLastSeenMessageByConversationId,
  toggleConversationFavorite,
  updateMessageRestrictions,
} from "@/apis/conversation";
import { createMutationHook } from "@/query/config/createMutationFactory";
import { updateUser } from "@/apis/user";
import {
  ConversationReadInfo,
  IConversation,
  TMessageForward,
  UpdateUserInput,
} from "@/types/chat/types";
import { conversationQueryKeys, userQueryKeys } from "@/constants/queryKeys";
import { IUser } from "@/types/user/types";
import { forwardMessages, unsendMessage } from "@/apis/message";

export const useArchiveConversationMutation = createMutationHook<void, number>(
  archiveConversationById,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][]
);

export const useToggleConversationFavoriteMutation = createMutationHook<void, string>(
  toggleConversationFavorite,
  (keyParams: { userId: number; conversationId: number; criteria: ConversationFilterCriteria }) =>
    () =>
      [
        conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria),
        conversationQueryKeys.groupProfileInfo(keyParams.userId, keyParams.conversationId),
        conversationQueryKeys.participantProfileInfo(keyParams.userId, keyParams.conversationId),
      ] as string[][]
);

export const useUpdateUserMutation = createMutationHook<IUser, UpdateUserInput>(
  updateUser,
  (keyParams: { userId: number }) => () =>
    [userQueryKeys.userProfile(keyParams.userId)] as string[][]
);

export const useForwardMessageMutation = createMutationHook<void, TMessageForward>(
  (params) => forwardMessages(params),
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][]
);

export const usePatchUnsendMessageMutation = createMutationHook<void, { messageId: number }>(
  unsendMessage
);

export const useSetLastSeenMessageMutation = createMutationHook<
  { data: ConversationReadInfo },
  { messageId: number; conversationId: number }
>(({ messageId, conversationId }) => setLastSeenMessageByConversationId(messageId, conversationId));

export const useUpdateMessageRestrictionsMutation = createMutationHook<
  IConversation,
  { conversationId: number; onlyAdminsCanSendMessages: boolean }
>(
  ({ conversationId, onlyAdminsCanSendMessages }) =>
    updateMessageRestrictions(conversationId, onlyAdminsCanSendMessages),
  (keyParams: { userId: number; conversationId: number }) => () =>
    [conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId)] as string[][]
);
