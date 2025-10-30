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
  ConversationFilterCriteria,
  deleteConversationByID,
  removeConversationParticipant,
  updateConversationParticipantRole,
} from "@/apis/conversation";
import { unblockUser } from "@/apis/user";
import { removeMessageReaction } from "@/apis/message";
import {
  conversationMessageQueryKeys,
  conversationQueryKeys,
} from "@/constants/queryKeys";
import { createMutationHook } from "@/query/config/createMutationFactory";

export const useDeleteConversationByIdMutation = createMutationHook<
  void,
  number
>(
  deleteConversationByID,
  (keyParams: { userId: number; criteria: ConversationFilterCriteria }) => () =>
    [
      conversationQueryKeys.allConversations(
        keyParams.userId,
        keyParams.criteria,
      ),
    ] as string[][],
);

export const useRemoveMessageReactionMutation = createMutationHook<
  void,
  number
>(
  removeMessageReaction,
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationMessageQueryKeys.messages(
        keyParams.userId,
        keyParams.conversationId,
      ),
    ] as string[][],
);

export const useUnblockUserMutation = createMutationHook<void, number>(
  unblockUser,
  (keyParams: { userId: number; conversationId: number }) => () =>
    [
      conversationQueryKeys.metaDataById(
        keyParams.userId,
        keyParams.conversationId,
      ),
      conversationQueryKeys.participantProfileInfo(
        keyParams.userId,
        keyParams.conversationId,
      ),
    ] as string[][],
);

export const useRemoveConversationParticipantMutation = createMutationHook<
  void,
  { conversationId: number; participantId: number }
>(
  (params: { conversationId: number; participantId: number }) =>
    removeConversationParticipant(params.conversationId, params.participantId),
  (keyParams: { conversationId: number; participantId: number }) => () =>
    [
      conversationQueryKeys.ConversationParticipant(
        keyParams.conversationId,
        keyParams.participantId,
      ),
    ] as string[][],
);

export const useUpdateConversationParticipantRoleMutation = createMutationHook<
  void,
  { conversationId: number; participantId: number; makeAdmin: boolean }
>(
  (params: {
    conversationId: number;
    participantId: number;
    makeAdmin: boolean;
  }) =>
    updateConversationParticipantRole(
      params.conversationId,
      params.participantId,
      params.makeAdmin,
    ),
  (keyParams: { conversationId: number; participantId: number }) => () =>
    [
      conversationQueryKeys.ConversationParticipant(
        keyParams.conversationId,
        keyParams.participantId,
      ),
    ] as string[][],
);
