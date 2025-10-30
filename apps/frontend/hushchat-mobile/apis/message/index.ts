/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  CONVERSATION_API_ENDPOINTS,
  MESSAGE_API_ENDPOINTS,
} from "@/constants/apiConstants";
import { IMessageReactionRequest } from "@/types/chat/types";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import axios, { AxiosError } from "axios";

/**
 * Add a reaction to a message
 */
export const addMessageReaction = async (
  messageId: number,
  reaction: IMessageReactionRequest,
) => {
  try {
    const response = await axios.post(
      MESSAGE_API_ENDPOINTS.REACTIONS(messageId),
      reaction,
    );
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
    const response = await axios.delete(
      MESSAGE_API_ENDPOINTS.REACTIONS(messageId),
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const pinMessage = async (params: {
  conversationId: number;
  messageId: number;
}) => {
  try {
    const response = await axios.post(
      CONVERSATION_API_ENDPOINTS.PIN_MESSAGE(
        params.conversationId,
        params.messageId,
      ),
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
  customText: string;
}) => {
  try {
    const response = await axios.put(MESSAGE_API_ENDPOINTS.FORWARD, {
      forwardedMessageIds: params.forwardedMessageIds,
      conversationIds: params.conversationIds,
      customText: params.customText,
    });
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};

export const unsendMessage = async (params: { messageId: number }) => {
  try {
    const response = await axios.patch(
      MESSAGE_API_ENDPOINTS.UNSEND(params.messageId),
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
  size: number = 20,
) => {
  try {
    const response = await axios.get(
      MESSAGE_API_ENDPOINTS.REACTIONS(messageId),
      {
        params: { page, size },
      },
    );
    return { data: response.data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError?.response?.data?.error || axiosError?.message };
  }
};
