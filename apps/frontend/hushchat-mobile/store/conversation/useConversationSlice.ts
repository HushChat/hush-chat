import { ConversationType } from '@/types/chat/types';
import { StateCreator } from 'zustand';

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
  setSelectedConversationType: (type: ConversationType) => set({ selectedConversationType: type }),
  selectionMode: false,
  setSelectionMode: (mode: boolean) => set({ selectionMode: mode }),
  selectedMessageIds: new Set<number>(),
  setSelectedMessageIds: (ids: Set<number>) => set({ selectedMessageIds: new Set(ids) }),
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
