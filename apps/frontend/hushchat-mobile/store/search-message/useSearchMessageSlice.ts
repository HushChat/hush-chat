import { StateCreator } from "zustand";

export interface SearchState {
  searchSelectedConversationId: number | null;
  searchSelectedMessageId: number | null;
  setSearchSelectedMessageId: (conversationId: number | null, messageId: number | null) => void;
  clearSearchSelectedMessage: () => void;
}

export const createSearchSelectedMessageSlice: StateCreator<SearchState> = (set) => ({
  searchSelectedConversationId: null,
  searchSelectedMessageId: null,

  setSearchSelectedMessageId: (conversationId: number | null, messageId: number | null) => {
    set({ searchSelectedConversationId: conversationId, searchSelectedMessageId: messageId });
  },

  clearSearchSelectedMessage: () => {
    set({ searchSelectedConversationId: null, searchSelectedMessageId: null });
  },
});
