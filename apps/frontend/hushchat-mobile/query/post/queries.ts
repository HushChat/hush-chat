import {
  addConversationParticipants,
  ConversationFilterCriteria,
  createGroupConversation,
  createOneToOneConversation,
  sendMessageByConversationId,
  updateConversationById,
  togglePinConversation,
  toggleMuteConversation,
  ToggleMuteConversationParams,
  exitGroupConversation,
  reportConversation,
} from '@/apis/conversation';
import { blockUser } from '@/apis/user';
import { createMutationHook } from '@/query/config/createMutationFactory';
import { addMessageReaction, pinMessage } from '@/apis/message';
import {
  IConversation,
  IGroupConversation,
  IMessage,
  IMessageReactionRequest,
} from '@/types/chat/types';
import { conversationMessageQueryKeys, conversationQueryKeys } from '@/constants/queryKeys';

/**
 * Mutation factory for creating one-to-one conversations.
 * 
 * Takes a userId parameter and automatically invalidates ['conversations'] cache on success.
 * Use the returned hook to handle conversation creation and navigation.
 * 
 * @example
 * ```typescript
 * const createConversation = useCreateOneToOneConversationQuery((conversation) => {
 *   handleChatPress(setSelectedConversation)(conversation);
 * }, () => {
    // Optionally handle onError
  });
 * 
 * const handleCreateConversation = (userId: number) => {
 *   createConversation.mutate(userId);
 * };
 * ```
 */
export const useCreateOneToOneConversationMutation = createMutationHook<IConversation, number>(
  createOneToOneConversation,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][],
);

export const usePinMessageMutation = createMutationHook<
  IMessage,
  { conversationId: number; messageId: number }
>(pinMessage);

export const useTogglePinConversationMutation = createMutationHook<void, number>(
  togglePinConversation,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][],
);

export const useCreateGroupConversationMutation = createMutationHook<
  IConversation,
  IGroupConversation
>(
  createGroupConversation,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][],
);

export const useCreateAddParticipantsMutation = createMutationHook<
  void,
  { conversationId: number; newParticipantIds: number[] }
>(
  addConversationParticipants,
  (keyParams: { conversationId: number; keyword: string }) => () =>
    [
      conversationQueryKeys.ConversationParticipants(keyParams.conversationId, keyParams.keyword),
    ] as string[][],
);

export const usePatchConversationQuery = createMutationHook<
  IConversation,
  { conversationId: number; name: string; description: string }
>(
  ({ conversationId, name, description }) =>
    updateConversationById(conversationId, name, description),
  (keyParams: { userId: number; conversationId: number }) => () =>
    [conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId)] as string[][],
);

export const useSendMessageMutation = createMutationHook<
  IMessage,
  { conversationId: number; message: string; parentMessageId?: number }
>(
  ({ conversationId, message, parentMessageId }) =>
    sendMessageByConversationId(conversationId, message, parentMessageId),
  (keyParams: { userId: number; conversationId: number; criteria: ConversationFilterCriteria }) =>
    () => {
      return [
        conversationMessageQueryKeys.messages(keyParams.userId, keyParams.conversationId),
        conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria),
      ] as string[][];
    },
);

export const useAddMessageReactionMutation = createMutationHook<
  void,
  { messageId: number; reaction: IMessageReactionRequest }
>(
  ({ messageId, reaction }) => addMessageReaction(messageId, reaction),
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationMessageQueryKeys.messages(keyParams.userId, keyParams.conversationId),
    ] as string[][],
);

export const useBlockUserMutation = createMutationHook<void, number>(
  blockUser,
  (keyParams: { userId: number; conversationId: number; criteria: ConversationFilterCriteria }) =>
    () =>
      [
        conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId),
        conversationQueryKeys.participantProfileInfo(keyParams.userId, keyParams.conversationId),
      ] as string[][],
);

export const useToggleMuteConversationMutation = createMutationHook<
  void,
  ToggleMuteConversationParams
>(
  toggleMuteConversation,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][],
);

export const useExitGroupConversationMutation = createMutationHook<void, number>(
  exitGroupConversation,
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId),
      conversationQueryKeys.groupProfileInfo(keyParams.userId, keyParams.conversationId),
    ] as string[][],
);

export const useReportConversationMutation = createMutationHook<{
  conversationId: number;
  reason: string;
}>(reportConversation);
