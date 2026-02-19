import { create } from "zustand";
import {
  AttachmentUploadState,
  createAttachmentUploadSlice,
} from "@/store/attachmentUpload/useAttachmentUploadSlice";

export const useAttachmentUploadStore = create<AttachmentUploadState>((set, get, store) => ({
  ...createAttachmentUploadSlice(set, get, store),
}));
