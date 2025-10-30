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

import { ConversationType } from "@/types/chat/types";
import { StateCreator } from "zustand";

export interface ConversationState {
  selectedConversationType: ConversationType;
  setSelectedConversationType: (type: ConversationType) => void;
  selectionMode: boolean;
  setSelectionMode: (mode: boolean) => void;
  selectedMessageIds: Set<number>;
  setSelectedMessageIds: (ids: Set<number>) => void;
  resetState: () => void;
}

export const createConversationSlice: StateCreator<ConversationState> = (
  set,
): ConversationState => ({
  selectedConversationType: ConversationType.ALL,
  setSelectedConversationType: (type: ConversationType) =>
    set({ selectedConversationType: type }),
  selectionMode: false,
  setSelectionMode: (mode: boolean) => set({ selectionMode: mode }),
  selectedMessageIds: new Set<number>(),
  setSelectedMessageIds: (ids: Set<number>) =>
    set({ selectedMessageIds: new Set(ids) }),
  resetState: () =>
    set({
      selectedConversationType: ConversationType.ALL,
      selectionMode: false,
      selectedMessageIds: new Set<number>(),
    }),
});

export const selectedConversationType = (state: ConversationState) =>
  state.selectedConversationType;
export const setSelectedConversationType = (state: ConversationState) =>
  state.setSelectedConversationType;
