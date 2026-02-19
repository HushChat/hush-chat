import { StateCreator } from "zustand";

export interface AttachmentUploadState {
  pendingMessageIds: Set<number>;
  addPendingId: (id: number) => void;
  removePendingId: (id: number) => void;
  removePendingIds: (ids: number[]) => void;
  setPendingIds: (ids: number[]) => void;
  resetUploadState: () => void;
}

export const createAttachmentUploadSlice: StateCreator<AttachmentUploadState> = (
  set
): AttachmentUploadState => ({
  pendingMessageIds: new Set<number>(),

  addPendingId: (id: number) =>
    set((state) => {
      const newSet = new Set(state.pendingMessageIds);
      newSet.add(id);
      return { pendingMessageIds: newSet };
    }),

  removePendingId: (id: number) =>
    set((state) => {
      const newSet = new Set(state.pendingMessageIds);
      newSet.delete(id);
      return { pendingMessageIds: newSet };
    }),

  removePendingIds: (ids: number[]) =>
    set((state) => {
      const newSet = new Set(state.pendingMessageIds);
      ids.forEach((id) => newSet.delete(id));
      return { pendingMessageIds: newSet };
    }),

  setPendingIds: (ids: number[]) => set({ pendingMessageIds: new Set(ids) }),

  resetUploadState: () => set({ pendingMessageIds: new Set<number>() }),
});

export const selectPendingMessageIds = (state: AttachmentUploadState) => state.pendingMessageIds;
export const selectIsMessageUploading = (id: number) => (state: AttachmentUploadState) =>
  state.pendingMessageIds.has(id);
