export const AUTH_API_ENDPOINTS = {
  LOGIN: "/public/user/auth/login",
  REGISTER: "/public/user/auth/register",
  REFRESH_TOKEN: "/public/user/refresh-token",
  VERIFY_OTP: "/public/user/auth/confirm-signup",
  LOGOUT: (accessToken: string) => `/public/user/sign-out?accessToken=${accessToken}`,
  FORGOT_PASSWORD: "/public/user/auth/forgot-password",
  CONFIRM_FORGOT_PASSWORD: "/public/user/auth/confirm-forgot-password",
  RESEND_OTP: "/public/user/auth/resend-signup",
};

export const TOKEN_TYPE = "Bearer";

export const CONVERSATION_API_BASE = "/conversations";
export const USER_API_BASE = "/users";
export const MESSAGE_API_BASE = "/messages";
export const SEARCH_API_BASE = "/search";
export const WORKSPACES_API_BASE = "/workspaces";
export const WORKSPACE_ADMIN_API_BASE = "/admin/workspace";
export const GIF_API_BASE = "/tenor";

export const WORKSPACE_ENDPOINTS = {
  GET: `${WORKSPACES_API_BASE}/my-workspaces`,
  REGISTER_WORKSPACE: `${WORKSPACES_API_BASE}/register`,
  CREATE_WORKSPACE: WORKSPACES_API_BASE,
  INVITE_TO_WORKSPACE: `${WORKSPACE_ADMIN_API_BASE}/invite`,
};

export const SETTINGS_API_BASE = "/settings";

export const CONVERSATION_API_ENDPOINTS = {
  ALL: CONVERSATION_API_BASE,
  GET_BY_ID: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/meta`,
  MESSAGES: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/messages`,
  GET_MESSAGE_BY_ID: (conversationId: number, messageId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/${messageId}`,
  EDIT_MESSAGE: (conversationId: number, messageId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/${messageId}`,
  SIGNED_URLS: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/upload-signed-url`,
  ARCHIVE: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/archive`,
  FAVOURITE: (conversationId: string) => `${CONVERSATION_API_BASE}/${conversationId}/favorite`,
  GET_OTHER_PARTICIPANT: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/profile`,
  GROUP: `${CONVERSATION_API_BASE}/group`,
  GET_GROUP_PROFILE: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/group-profile`,
  SEARCH_MESSAGES: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/search`,
  SEARCH_CONVERSATIONS: `${CONVERSATION_API_BASE}/search`,
  PIN_CONVERSATION: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/pin`,
  DELETE_CONVERSATION_PARTICIPANT: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/participant`,
  GROUP_IMAGE_SIGNED_URL: (conversationId: string) =>
    `${CONVERSATION_API_BASE}/${conversationId}/upload-group-icon`,
  EXIT_GROUP: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/leave`,
  REPORT_GROUP: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/report`,
  CREATE_ONE_TO_ONE: `${CONVERSATION_API_BASE}/one-to-one`,
  CONVERSATION_PARTICIPANTS: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/participants`,
  PIN_MESSAGE: (conversationId: number, messageId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/${messageId}/pin`,
  REMOVE_CONVERSATION_PARTICIPANT: (conversationId: number, participantId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/participants/${participantId}`,
  TOGGLE_MUTE_CONVERSATION: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/mute`,
  UPDATE_CONVERSATION: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}`,
  UPDATE_MESSAGE_RESTRICTIONS: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/message-restrictions`,
  UPDATE_CONVERSATION_PARTICIPANT_ROLE: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/admins`,
  SET_LAST_SEEN_MESSAGE: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/last-read-status`,
  GET_LAST_SEEN_MESSAGE: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/last-read-status`,
  GET_MESSAGE_SEEN_PARTICIPANTS: (conversationId: number, messageId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/${messageId}/seen-by`,
  REQUEST_ATTACHMENT_UPLOAD_URL: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/upload-message-signed-url`,
  RESET_INVITE_LINK: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/invite-link`,
  GET_INVITE_LINK: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/invite-link`,
  GET_CONVERSATION_ATTACHMENTS: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/attachments`,
  TOGGLE_NOTIFY_ONLY_ON_MENTIONS: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/notifications/mentions-only`,
  JOIN_VIA_INVITE_LINK: (token: string) => `${CONVERSATION_API_BASE}/invite-link/${token}/join`,
  MARK_MESSAGE_AS_UNREAD: (conversationId: number, messageId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/messages/${messageId}/mark-unread`,
};

export const USER_API_ENDPOINTS = {
  GET: USER_API_BASE,
  UPDATE: USER_API_BASE,
  WHO_AM_I: `${USER_API_BASE}/whoami`,
  BLOCK_USER: (blockedUserId: number) => `${USER_API_BASE}/${blockedUserId}/block`,
  UNBLOCK_USER: (blockedUserId: number) => `${USER_API_BASE}/${blockedUserId}/unblock`,
  CALL_LOGS: `${USER_API_BASE}/call-logs`,
  PROFILE_IMAGE_SIGNED_URL: (userId: string) => `/users/${userId}/profile/upload-photo`,
  SAVE_TOKEN: `/notifications/device-token`,
  CHANGE_PASSWORD: `/users/change-password`,
  CHANGE_AVAILABILITY_STATUS: `${USER_API_BASE}/availability`,
};

export const MESSAGE_API_ENDPOINTS = {
  REACTIONS: (messageId: number) => `${MESSAGE_API_BASE}/${messageId}/reactions`,
  FORWARD: `${MESSAGE_API_BASE}/forward`,
  UNSEND: (messageId: number) => `${MESSAGE_API_BASE}/${messageId}/unsend`,
  MENTIONED_MESSAGES: `${MESSAGE_API_BASE}/mentions`,
};

export const SETTINGS_API_ENDPOINTS = {
  CONTACT_US: `${SETTINGS_API_BASE}/contact-us`,
};

export const GIF_API_ENDPOINTS = {
  TRENDING: `${GIF_API_BASE}/featured`,
  SEARCH: `${GIF_API_BASE}/search`,
};
