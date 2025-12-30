import { AttachmentFilterCriteria, type ConversationFilterCriteria } from "@/apis/conversation";

const CALL_LOGS = "call-logs";
const GROUP_INFO = "group-info";
const WORKSPACES = "workspaces";

const CONVERSATION_QUERY_BASE_KEY = "conversations";
const CONVERSATION_META_QUERY_BASE_KEY = "conversation-meta";
const CONVERSATION_MESSAGE_QUERY_BASE_KEY = "conversation-messages";
const CONVERSATION_ATTACHMENTS_QUERY_BASE_KEY = "conversation-attachments";
const MESSAGE_REACTION_QUERY_BASE_KEY = "message-reactions";
const USER_QUERY_BASE_KEY = "users";

export const conversationQueryKeys = {
  metaDataById: (userId: number, conversationId: number) => [
    CONVERSATION_META_QUERY_BASE_KEY,
    conversationId,
    userId,
  ],

  allConversations: (userId: number, criteria: ConversationFilterCriteria) => [
    CONVERSATION_QUERY_BASE_KEY,
    userId,
    criteria,
  ],

  participantProfileInfo: (userId: number, conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    "profile",
    userId,
  ],

  groupProfileInfo: (userId: number, conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    GROUP_INFO,
    userId,
  ],

  conversationInviteLink: (conversationId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    "invite-link",
  ],

  joinConversationByInvite: (token: string) => [
    CONVERSATION_QUERY_BASE_KEY,
    token,
    "join-by-invite",
  ],

  ConversationParticipants: (conversationId: number, keyword: string) => [
    CONVERSATION_QUERY_BASE_KEY,
    keyword,
    conversationId,
  ],

  ConversationParticipant: (conversationId: number, participantId: number) => [
    CONVERSATION_QUERY_BASE_KEY,
    conversationId,
    participantId,
  ],

  lastSeenMessage: (conversationId: number) => [
    CONVERSATION_MESSAGE_QUERY_BASE_KEY,
    conversationId,
  ],

  conversationAttachments: (
    conversationId: number,
    criteria: AttachmentFilterCriteria,
    pageSize: number
  ) => [CONVERSATION_ATTACHMENTS_QUERY_BASE_KEY, conversationId, criteria, pageSize],
};

export const conversationMessageQueryKeys = {
  messages: (userId: number, conversationId: number) => [
    CONVERSATION_MESSAGE_QUERY_BASE_KEY,
    conversationId,
    userId,
  ],

  messageReactions: (messageId: number) => [MESSAGE_REACTION_QUERY_BASE_KEY, messageId],

  messagesWithLink: (conversationId: number, pageSize: number) => [
    CONVERSATION_MESSAGE_QUERY_BASE_KEY,
    conversationId,
    "links",
    pageSize,
  ],
};

export const userQueryKeys = {
  callLogs: (userId: number) => [USER_QUERY_BASE_KEY, CALL_LOGS, userId],

  userProfile: (userId: number) => [USER_QUERY_BASE_KEY, userId],

  userWorkspace: (userId: number) => [USER_QUERY_BASE_KEY, WORKSPACES, userId],

  changePassword: () => [USER_QUERY_BASE_KEY, "change-password"],
};
