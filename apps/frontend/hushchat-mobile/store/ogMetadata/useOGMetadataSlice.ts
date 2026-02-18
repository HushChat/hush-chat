import { TMessageUrlMetadata } from "@/types/chat/types";
import { StateCreator } from "zustand";

export interface OGMetadataState {
  metadata: Record<number, TMessageUrlMetadata>;
  pendingMessageIds: Set<number>;
  setMetadata: (messageId: number, data: TMessageUrlMetadata) => void;
  setBulkMetadata: (data: Record<number, TMessageUrlMetadata>) => void;
  getMetadata: (messageId: number) => TMessageUrlMetadata | undefined;
  addPendingIds: (ids: number[]) => void;
  removePendingIds: (ids: number[]) => void;
  hasMetadata: (messageId: number) => boolean;
  isPending: (messageId: number) => boolean;
}

export const createOGMetadataSlice: StateCreator<OGMetadataState> = (set, get) => ({
  metadata: {},
  pendingMessageIds: new Set(),

  setMetadata: (messageId, data) => {
    set((state) => ({
      metadata: { ...state.metadata, [messageId]: data },
    }));
  },

  setBulkMetadata: (data) => {
    set((state) => ({
      metadata: { ...state.metadata, ...data },
    }));
  },

  getMetadata: (messageId) => {
    return get().metadata[messageId];
  },

  addPendingIds: (ids) => {
    set((state) => {
      const newSet = new Set(state.pendingMessageIds);
      ids.forEach((id) => newSet.add(id));
      return { pendingMessageIds: newSet };
    });
  },

  removePendingIds: (ids) => {
    set((state) => {
      const newSet = new Set(state.pendingMessageIds);
      ids.forEach((id) => newSet.delete(id));
      return { pendingMessageIds: newSet };
    });
  },

  hasMetadata: (messageId) => {
    return messageId in get().metadata;
  },

  isPending: (messageId) => {
    return get().pendingMessageIds.has(messageId);
  },
});
