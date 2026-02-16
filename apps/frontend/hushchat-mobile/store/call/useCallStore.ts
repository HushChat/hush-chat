import { create } from "zustand";
import { CallState, createCallSlice } from "@/store/call/useCallSlice";

export const useCallStore = create<CallState>((set, get, store) => ({
  ...createCallSlice(set, get, store),
}));
