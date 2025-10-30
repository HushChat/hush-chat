import { create } from "zustand";
import {
  ConversationState,
  createConversationSlice,
} from "@/store/conversation/useConversationSlice";

export const useConversationStore = create<ConversationState>(
  (set, get, store) => ({
    ...createConversationSlice(set, get, store),
  }),
);
