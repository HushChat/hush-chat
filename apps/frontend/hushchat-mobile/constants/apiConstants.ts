export const AUTH_API_ENDPOINTS = {
  LOGIN: '/public/user/auth/login',
  REGISTER: '/public/user/auth/register',
  REFRESH_TOKEN: '/public/user/refresh-token',
  VERIFY_OTP: '/public/user/auth/confirm-signup',
  LOGOUT: (accessToken: string) => `/public/user/sign-out?accessToken=${accessToken}`,
  FORGOT_PASSWORD: '/public/user/auth/forgot-password',
  CONFIRM_FORGOT_PASSWORD: '/public/user/auth/confirm-forgot-password',
  RESEND_OTP: '/public/user/auth/resend-signup',
};

export const TOKEN_TYPE = 'Bearer';

export const CONVERSATION_API_BASE = '/conversations';
export const USER_API_BASE = '/users';
export const MESSAGE_API_BASE = '/messages';
export const SEARCH_API_BASE = '/search';

export const CONVERSATION_API_ENDPOINTS = {
  ALL: CONVERSATION_API_BASE,
  GET_BY_ID: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/meta`,
  MESSAGES: (conversationId: number) => `${CONVERSATION_API_BASE}/${conversationId}/messages`,
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
  UPDATE_CONVERSATION_PARTICIPANT_ROLE: (conversationId: number) =>
    `${CONVERSATION_API_BASE}/${conversationId}/admins`,
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
};

export const MESSAGE_API_ENDPOINTS = {
  REACTIONS: (messageId: number) => `${MESSAGE_API_BASE}/${messageId}/reactions`,
  FORWARD: `${MESSAGE_API_BASE}/forward`,
  UNSEND: (messageId: number) => `${MESSAGE_API_BASE}/${messageId}/unsend`,
};
