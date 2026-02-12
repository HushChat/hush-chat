import {
  archiveConversationById,
  ConversationFilterCriteria,
  editMessageById,
  setLastSeenMessageByConversationId,
  toggleConversationFavorite,
  toggleNotifyOnlyOnMention,
  updateMessageRestrictions,
} from "@/apis/conversation";
import { createMutationHook } from "@/query/config/createMutationFactory";
import { toggleWorkspaceUserRole, updateUser } from "@/apis/user";
import {
  ConversationReadInfo,
  IConversation,
  IMessage,
  TMessageForward,
  TMessageForwardResponse,
  UpdateUserInput,
} from "@/types/chat/types";
import {
  conversationMessageQueryKeys,
  conversationQueryKeys,
  userQueryKeys,
  workspaceAdminQueryKeys,
} from "@/constants/queryKeys";
import { IUser } from "@/types/user/types";
import { forwardMessages, markMessageAsUnread, unsendMessage } from "@/apis/message";

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

export const useForwardMessageMutation = createMutationHook<
  TMessageForwardResponse,
  TMessageForward
>(
  (params) => forwardMessages(params),
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][]
);

export const usePatchUnsendMessageMutation = createMutationHook<void, { messageId: number }>(
  unsendMessage
);

export const useMarkMessageAsUnreadMutation = createMutationHook<
  void,
  { messageId: number; conversationId: number }
>(
  markMessageAsUnread,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [conversationQueryKeys.allConversations(keyParams.userId, keyParams.criteria)] as string[][]
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

export const useToggleNotifyOnlyOnMentionMutation = createMutationHook<
  IConversation,
  { conversationId: number }
>(
  ({ conversationId }) => toggleNotifyOnlyOnMention(conversationId),
  (keyParams: { userId: number; conversationId: number }) => () =>
    [conversationQueryKeys.metaDataById(keyParams.userId, keyParams.conversationId)] as string[][]
);

export const useEditMessageMutation = createMutationHook<
  IMessage,
  { conversationId: number; messageId: number; messageText: string; isMarkdownEnabled: boolean }
>(
  ({ conversationId, messageId, messageText, isMarkdownEnabled }) =>
    editMessageById(conversationId, messageId, messageText, isMarkdownEnabled),
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationMessageQueryKeys.messages(keyParams.userId, keyParams.conversationId),
    ] as string[][]
);

export const useToggleUserRoleMutation = createMutationHook<void, { email: string }>(
  ({ email }) => toggleWorkspaceUserRole(email),
  (keyParams: { userId: number }) => () =>
    [workspaceAdminQueryKeys.chatUserById(keyParams.userId), ["workspace-chat-users"]] as string[][]
);
