import { ErrorResponse } from "@/utils/apiErrorUtils";
import { ToastUtils } from "@/utils/toastUtils";
import axios, { AxiosError } from "axios";
import {
  IConversation,
  IGroupConversation,
  IMessage,
  IMessageView,
  MessageAttachmentTypeEnum,
} from "@/types/chat/types";
import {
  CONVERSATION_API_ENDPOINTS,
  SEARCH_API_BASE,
  SETTINGS_API_ENDPOINTS,
  USER_API_ENDPOINTS,
  WORKSPACE_ENDPOINTS,
} from "@/constants/apiConstants";
import { ApiResponse } from "@/types/common/types";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import type { QueryKey } from "@tanstack/react-query";

export interface ConversationFilterCriteria {
  isArchived?: boolean;
  isFavorite?: boolean;
  isDeleted?: boolean;
  isMuted?: boolean;
}

export interface CursorPaginatedResponse<T> {
  content: T[];
  size?: number;
  number?: number;
  last?: boolean;
}

export type CursorQueryFnType<T> = (params: {
  beforeId?: number;
  afterId?: number;
  size: number;
}) => Promise<ApiResponse<CursorPaginatedResponse<T>>>;

export interface CursorPaginatedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: CursorQueryFnType<T>;
  pageSize?: number;
  enabled?: boolean;
  allowForwardPagination?: boolean;
}

export interface AddConversationParticipantsParams {
  conversationId: number;
  newParticipantIds: number[];
}
export interface ToggleMuteConversationParams {
  conversationId: number;
  duration: "15m" | "1h" | "1d" | "always";
}

export type ReportReason = "SPAM" | "HARASSMENT" | "INAPPROPRIATE_CONTENT" | "OTHER";
export interface ReportConversationParams {
  conversationId: number;
  reason: ReportReason;
}

export interface AttachmentFilterCriteria {
  type: MessageAttachmentTypeEnum;
}

export const getAllConversations = async (
  criteria: ConversationFilterCriteria = {},
  offset: number = 0,
  size: number = 10
) => {
  try {
    const response = await axios.get(CONVERSATION_API_ENDPOINTS.ALL, {
      params: { ...criteria, offset, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getConversationMessagesByCursor = async (
  conversationId: number,
  { beforeId, afterId, size = 20 }: { beforeId?: number; afterId?: number; size?: number }
) => {
  try {
    const params: Record<string, number> = { size };
    if (beforeId) params.beforeId = beforeId;
    if (afterId) params.afterId = afterId;

    const response = await axios.get(CONVERSATION_API_ENDPOINTS.MESSAGES(conversationId), {
      params,
    });

    const data = response.data;
    return { data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error?: string }>;
    return {
      error: axiosError?.response?.data?.error || axiosError?.message || "Unknown error",
    };
  }
};

export const getConversationById = async (conversationId: number) => {
  const response = await axios.get(CONVERSATION_API_ENDPOINTS.GET_BY_ID(conversationId));
  return response.data;
};

export const updateConversationById = async (
  conversationId: number,
  name: string,
  description: string
) => {
  const response = await axios.patch(
    CONVERSATION_API_ENDPOINTS.UPDATE_CONVERSATION(conversationId),
    { name, description }
  );
  return { data: response.data };
};

export const updateMessageRestrictions = async (
  conversationId: number,
  onlyAdminsCanSendMessages: boolean
) => {
  const response = await axios.patch(
    `${CONVERSATION_API_ENDPOINTS.UPDATE_MESSAGE_RESTRICTIONS(conversationId)}`,
    { onlyAdminsCanSendMessages }
  );
  return { data: response.data };
};

export const toggleNotifyOnlyOnMention = async (conversationId: number) => {
  const response = await axios.patch(
    `${CONVERSATION_API_ENDPOINTS.TOGGLE_NOTIFY_ONLY_ON_MENTIONS(conversationId)}`
  );
  return { data: response.data };
};

export const getAllCallLogs = async (page: number = 0, size: number = 10) => {
  try {
    const response = await axios.get(USER_API_ENDPOINTS.CALL_LOGS, {
      params: { page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const archiveConversationById = async (conversationId: number) => {
  try {
    const response = await axios.patch(CONVERSATION_API_ENDPOINTS.ARCHIVE(conversationId));
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const sendMessageByConversationId = async (
  conversationId: number,
  message: string,
  parentMessageId?: number
): Promise<ApiResponse<IMessage>> => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.MESSAGES(conversationId), {
      messageText: message,
      parentMessageId: parentMessageId ?? null,
    });
    return { data: response.data };
  } catch (error) {
    ToastUtils.error("Failed to send message:" + error);
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getMessagesAroundMessageId = async (
  conversationId: number,
  targetMessageId: number
): Promise<ApiResponse<CursorPaginatedResponse<IMessageView>>> => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.GET_MESSAGE_BY_ID(conversationId, targetMessageId)
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const setLastSeenMessageByConversationId = async (
  messageId: number,
  conversationId: number
) => {
  try {
    const response = await axios.put(
      CONVERSATION_API_ENDPOINTS.SET_LAST_SEEN_MESSAGE(conversationId),
      {
        messageId,
      }
    );
    return { data: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getLastSeenMessageByConversationId = async (conversationId: number) => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.GET_LAST_SEEN_MESSAGE(conversationId)
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const sendMessageByConversationIdFiles = async (
  conversationId: number,
  message: string,
  fileNames: string[]
) => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.SIGNED_URLS(conversationId), {
      messageText: message,
      files: {
        fileNames,
      },
    });
    return response.data;
  } catch (error) {
    ToastUtils.error("Failed to send message:" + error);
  }
};

export const createMessagesWithAttachments = async (
  conversationId: number,
  attachments: {
    messageText: string;
    fileName: string;
    parentMessageId?: number | null;
  }[]
) => {
  try {
    const response = await axios.post(
      CONVERSATION_API_ENDPOINTS.REQUEST_ATTACHMENT_UPLOAD_URL(conversationId),
      attachments
    );

    return response.data;
  } catch (error) {
    ToastUtils.error("Unable to request attachment upload URL: " + error);
    throw error;
  }
};

export const toggleConversationFavorite = async (conversationId: string) => {
  try {
    const response = await axios.patch(
      CONVERSATION_API_ENDPOINTS.FAVOURITE(String(conversationId))
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getOtherParticipantProfile = async (conversationId: number) => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.GET_OTHER_PARTICIPANT(conversationId)
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const searchConversationMessages = async (
  conversationId: number,
  searchQuery: string
): Promise<IMessageView[]> => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.SEARCH_MESSAGES(conversationId), {
      searchKeyword: searchQuery,
    });

    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError?.response?.data?.error || axiosError?.message);
  }
};

export const createGroupConversation = async (groupInfo: IGroupConversation) => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.GROUP, groupInfo);
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getGroupProfile = async (conversationId: number) => {
  try {
    const response = await axios.get(CONVERSATION_API_ENDPOINTS.GET_GROUP_PROFILE(conversationId));
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const globalSearch = async (searchQuery: string) => {
  try {
    const response = await axios.post(SEARCH_API_BASE, {
      searchKeyword: searchQuery,
    });
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError?.response?.data?.error || axiosError?.message);
  }
};

export const getConversationParticipants = async (
  conversationId: number,
  keyword: string = "",
  page: number = 0,
  size: number = 20
) => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.CONVERSATION_PARTICIPANTS(conversationId),
      {
        params: { keyword, page, size },
      }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const addConversationParticipants = async ({
  conversationId,
  newParticipantIds,
}: AddConversationParticipantsParams) => {
  try {
    const response = await axios.post(
      CONVERSATION_API_ENDPOINTS.CONVERSATION_PARTICIPANTS(conversationId),
      { userIds: newParticipantIds }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    throw new Error(axiosError?.response?.data?.error || axiosError?.message);
  }
};

export const togglePinConversation = async (conversationId: number) => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.PIN_CONVERSATION(conversationId));
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const deleteConversationByID = async (conversationId: number) => {
  try {
    const response = await axios.delete(
      CONVERSATION_API_ENDPOINTS.DELETE_CONVERSATION_PARTICIPANT(conversationId)
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const exitGroupConversation = async (conversationId: number) => {
  try {
    const response = await axios.patch(CONVERSATION_API_ENDPOINTS.EXIT_GROUP(conversationId));
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return {
      error: axiosError?.response?.data?.message || axiosError?.message,
    };
  }
};

export const createOneToOneConversation = async (
  targetUserId: number
): Promise<ApiResponse<IConversation>> => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.CREATE_ONE_TO_ONE, {
      targetUserId: targetUserId,
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const toggleMuteConversation = async (params: ToggleMuteConversationParams) => {
  try {
    const response = await axios.patch(
      CONVERSATION_API_ENDPOINTS.TOGGLE_MUTE_CONVERSATION(params.conversationId),
      { duration: params.duration }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const removeConversationParticipant = async (
  conversationId: number,
  participantId: number
) => {
  try {
    const response = await axios.delete(
      CONVERSATION_API_ENDPOINTS.REMOVE_CONVERSATION_PARTICIPANT(conversationId, participantId)
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const updateConversationParticipantRole = async (
  conversationId: number,
  userId: number,
  makeAdmin: boolean
) => {
  try {
    const response = await axios.patch(
      CONVERSATION_API_ENDPOINTS.UPDATE_CONVERSATION_PARTICIPANT_ROLE(conversationId),
      { userId, makeAdmin }
    );
    return { data: response.data };
  } catch (error: unknown) {
    return { error: getAPIErrorMsg(error) };
  }
};

export const reportConversation = async ({
  conversationId,
  reason,
}: ReportConversationParams): Promise<void> => {
  try {
    await axios.post(CONVERSATION_API_ENDPOINTS.REPORT_GROUP(conversationId), {
      reason,
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorMsg =
      axiosError?.response?.data?.error || "Failed to report group. Please try again later.";
    throw new Error(errorMsg);
  }
};

export const sendContactUsMessage = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  try {
    const response = await axios.post(SETTINGS_API_ENDPOINTS.CONTACT_US, data);
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
};

export const sendInviteToWorkspace = async (email: string) => {
  try {
    const response = await axios.post(WORKSPACE_ENDPOINTS.INVITE_TO_WORKSPACE, {
      email: email,
    });
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
};

export const getConversationAttachments = async (
  conversationId: number,
  criteria: AttachmentFilterCriteria,
  page: number,
  size: number
) => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.GET_CONVERSATION_ATTACHMENTS(conversationId),
      {
        params: { ...criteria, page, size },
      }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const ResetInviteLink = async (conversationId: number) => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.RESET_INVITE_LINK(conversationId));
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
};

export const getInviteLink = async (conversationId: number) => {
  try {
    const response = await axios.get(CONVERSATION_API_ENDPOINTS.GET_INVITE_LINK(conversationId));
    return response.data;
  } catch (error: any) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const joinConversationByInvite = async (token: string) => {
  try {
    const response = await axios.post(CONVERSATION_API_ENDPOINTS.JOIN_VIA_INVITE_LINK(token));
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
};

export const getCommonGroups = async (
  conversationId: number,
  page: number = 0,
  size: number = 20
) => {
  try {
    const response = await axios.get(CONVERSATION_API_ENDPOINTS.GET_COMMON_GROUPS(conversationId), {
      params: { page, size },
    });
    return { data: response.data };
  } catch (error: any) {
    return { error: error.response?.data?.error || error.message };
  }
};
