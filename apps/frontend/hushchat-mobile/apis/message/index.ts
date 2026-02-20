import { CONVERSATION_API_ENDPOINTS, MESSAGE_API_ENDPOINTS } from "@/constants/apiConstants";
import { IMessageReactionRequest, TMessageUrlMetadata } from "@/types/chat/types";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import axios, { AxiosError } from "axios";

/**
 * Add a reaction to a message
 */
export const addMessageReaction = async (messageId: number, reaction: IMessageReactionRequest) => {
  try {
    const response = await axios.post(MESSAGE_API_ENDPOINTS.REACTIONS(messageId), reaction);
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

/**
 * Remove a reaction from a message
 */
export const removeMessageReaction = async (messageId: number) => {
  try {
    const response = await axios.delete(MESSAGE_API_ENDPOINTS.REACTIONS(messageId));
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const pinMessage = async (params: {
  conversationId: number;
  messageId: number;
  duration: string | null;
}) => {
  try {
    const response = await axios.post(
      CONVERSATION_API_ENDPOINTS.PIN_MESSAGE(params.conversationId, params.messageId),
      null,
      {
        params: {
          duration: params.duration,
        },
      }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const forwardMessages = async (params: {
  forwardedMessageIds: number[];
  conversationIds: number[];
  userIds: number[];
  customText: string;
  isMarkdownEnabled: boolean;
}) => {
  try {
    const response = await axios.put(MESSAGE_API_ENDPOINTS.FORWARD, {
      forwardedMessageIds: params.forwardedMessageIds,
      conversationIds: params.conversationIds,
      userIds: params.userIds,
      customText: params.customText,
      isMarkdownEnabled: params.isMarkdownEnabled,
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const unsendMessage = async (params: { messageId: number }) => {
  try {
    const response = await axios.patch(MESSAGE_API_ENDPOINTS.UNSEND(params.messageId));
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const markMessageAsUnread = async (params: {
  messageId: number;
  conversationId: number;
}) => {
  try {
    const response = await axios.patch(
      CONVERSATION_API_ENDPOINTS.MARK_MESSAGE_AS_UNREAD(params.conversationId, params.messageId)
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getMessageReactions = async (
  messageId: number,
  page: number = 0,
  size: number = 20
) => {
  try {
    const response = await axios.get(MESSAGE_API_ENDPOINTS.REACTIONS(messageId), {
      params: { page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getMessageSeenParticipants = async (
  conversationId: number,
  messageId: number,
  page: number = 0,
  size: number = 20
) => {
  try {
    const response = await axios.get(
      CONVERSATION_API_ENDPOINTS.GET_MESSAGE_SEEN_PARTICIPANTS(conversationId, messageId),
      {
        params: { page, size },
      }
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getMentionedMessages = async (page: number = 0, size: number = 20) => {
  try {
    const response = await axios.get(MESSAGE_API_ENDPOINTS.MENTIONED_MESSAGES, {
      params: { page, size },
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const getMessageUrlMetadata = async (messageId: number) => {
  const response = await axios.get(MESSAGE_API_ENDPOINTS.GET_URL_METADATA(messageId));
  return response.data;
};

export const getBatchMessageUrlMetadata = async (
  messageIds: number[]
): Promise<Record<number, TMessageUrlMetadata>> => {
  const response = await axios.post(MESSAGE_API_ENDPOINTS.GET_BATCH_URL_METADATA, messageIds);
  return response.data;
};
