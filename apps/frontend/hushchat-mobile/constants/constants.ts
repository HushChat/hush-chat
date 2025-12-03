import { ConversationType } from "@/types/chat/types";
import { workspaceStatus } from "@/types/login/types";

export const USER_TOKEN_KEY = "userToken";
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const getDraftKey = (conversationId: number | string) => `draft_${conversationId}`;
export const MENTION_PREFIX = "@";
export const EMPTY_SET = new Set<number>();
export const WORKSPACE = "workspace";
export const X_TENANT = "X-Tenant";

export const TITLES = {
  ARCHIVE_CHAT: (conversationType: ConversationType) =>
    conversationType === ConversationType.ARCHIVED ? "Unarchive chat" : "Archive chat",
  TOGGLE_ROLE: (role: string) => (role === "ADMIN" ? "Remove Admin" : "Make Admin"),
  TOGGLE_SUSPENSION: (userStatus: workspaceStatus) =>
    userStatus === workspaceStatus.SUSPENDED ? "Unsuspend User" : "Suspend User",
  REMOVE_PARTICIPANT: "Remove participant",
  ADD_TO_FAVOURITES: "Add to favourites",
  REMOVE_FROM_FAVOURITES: "Remove from favourites",
  DELETE_CHAT: "Delete chat",
  PIN_CONVERSATION: "Pin Conversation",
  UNPIN_CONVERSATION: "Unpin Conversation",
};

export const USER_NOT_CONFIRMED_ERROR = "Please confirm your account.";
