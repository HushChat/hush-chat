import { TMessageUrlMetadata } from "@/types/chat/types";
import { StateCreator } from "zustand";

const MAX_CACHE_SIZE = 150;

/**
 * Trims a metadata record to keep only the newest entries (highest message IDs).
 */
function trimMetadata(
  metadata: Record<number, TMessageUrlMetadata>
): Record<number, TMessageUrlMetadata> {
  const keys = Object.keys(metadata).map(Number);
  if (keys.length <= MAX_CACHE_SIZE) return metadata;

  keys.sort((a, b) => b - a);
  const keysToKeep = keys.slice(0, MAX_CACHE_SIZE);
  const trimmed: Record<number, TMessageUrlMetadata> = {};
  for (const key of keysToKeep) {
    trimmed[key] = metadata[key];
  }
  return trimmed;
}

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
      metadata: trimMetadata({ ...state.metadata, [messageId]: data }),
    }));
  },

  setBulkMetadata: (data) => {
    set((state) => ({
      metadata: trimMetadata({ ...state.metadata, ...data }),
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
