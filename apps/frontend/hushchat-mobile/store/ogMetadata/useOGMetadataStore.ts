import { create } from "zustand";
import { createOGMetadataSlice, OGMetadataState } from "@/store/ogMetadata/useOGMetadataSlice";

export const useOGMetadataStore = create<OGMetadataState>((set, get, store) => ({
  ...createOGMetadataSlice(set, get, store),
}));
