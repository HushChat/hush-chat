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
  archiveConversationById,
  ConversationFilterCriteria,
  toggleConversationFavorite,
} from "@/apis/conversation";
import { createMutationHook } from "@/query/config/createMutationFactory";
import { updateUser } from "@/apis/user";
import { TMessageForward, UpdateUserInput } from "@/types/chat/types";
import { conversationQueryKeys, userQueryKeys } from "@/constants/queryKeys";
import { IUser } from "@/types/user/types";
import { forwardMessages, unsendMessage } from "@/apis/message";

export const useArchiveConversationMutation = createMutationHook<void, number>(
  archiveConversationById,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [
      conversationQueryKeys.allConversations(
        keyParams.userId,
        keyParams.criteria,
      ),
    ] as string[][],
);

export const useToggleConversationFavoriteMutation = createMutationHook<
  void,
  string
>(
  toggleConversationFavorite,
  (keyParams: {
    userId: number;
    conversationId: number;
    criteria: ConversationFilterCriteria;
  }) =>
    () =>
      [
        conversationQueryKeys.allConversations(
          keyParams.userId,
          keyParams.criteria,
        ),
        conversationQueryKeys.groupProfileInfo(
          keyParams.userId,
          keyParams.conversationId,
        ),
        conversationQueryKeys.participantProfileInfo(
          keyParams.userId,
          keyParams.conversationId,
        ),
      ] as string[][],
);

export const useUpdateUserMutation = createMutationHook<IUser, UpdateUserInput>(
  updateUser,
  (keyParams: { userId: number }) => () =>
    [userQueryKeys.userProfile(keyParams.userId)] as string[][],
);

export const useForwardMessageMutation = createMutationHook<
  void,
  TMessageForward
>(
  (params) => forwardMessages(params),
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [
      conversationQueryKeys.allConversations(
        keyParams.userId,
        keyParams.criteria,
      ),
    ] as string[][],
);

export const usePatchUnsendMessageMutation = createMutationHook<
  void,
  { messageId: number }
>(unsendMessage);
