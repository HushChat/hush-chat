import { Href } from "expo-router";

export const CHATS_PATH = "/(tabs)/conversations";
export const AUTH_WORKSPACE_FORM_PATH = "/(auth)/select-workspace";
export const AUTH_LOGIN_PATH = "/(auth)/login";
export const AUTH_FORGOT_PASSWORD_PATH = "/(auth)/forgot-password";
export const AUTH_FORGOT_PASSWORD_RESET_PATH = "/(auth)/forgot-password-reset";
export const AUTH_REGISTER_PATH = "/(auth)/register";
export const WORKSPACE_REGISTER_PATH = "/(auth)/register-workspace";
export const WORKSPACE_CREATE_PATH = "/(auth)/create-workspace";
export const VERIFY_OTP_PATH = "/(auth)/verify-otp";
export const CHAT_VIEW_PATH = "/conversation-threads";
export const CONVERSATION_DETAIL = "/conversations/conversation-info/[id]";
export const ARCHIVED_CHATS_PATH = "/archived-chats";
export const SEARCH_VIEW_PATH = "/search-view";
export const CALL_LOGS_PATH = "/(tabs)/call-history";
export const PROFILE_PATH = "/(tabs)/profile";
export const FORWARD_PATH = "/conversations/forward-panel";
export const GROUP_CONVERSATION_SELECT_PARTICIPANTS = "/group-conversation/select-participants";
export const MENTIONED_MESSAGES = "/mentioned-messages-view";
export const SETTINGS_CONTACT = "/(tabs)/settings/contact";
export const SETTINGS_INVITE = "/(tabs)/settings/invite";
export const SETTINGS_WORKSPACE = "/(tabs)/settings/change-workspace";
export const SETTINGS_USERS = "/(tabs)/settings/users";
export const SETTINGS_USERS_LIST = "/(tabs)/settings/users/list";
export const USER_DETAILS = (userId: number): Href => `/(tabs)/settings/users/${userId}` as Href;
export const CONVERSATION = (id: number): Href => `/conversations/${id}` as Href;
export const MESSAGE_READ_PARTICIPANTS =
  "/conversations/[conversationId]/messages/[messageId]/read-by";
