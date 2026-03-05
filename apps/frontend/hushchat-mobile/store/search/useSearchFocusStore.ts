import { create } from "zustand";

interface SearchFocusState {
  isSearchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
}

export const useSearchFocusStore = create<SearchFocusState>((set) => ({
  isSearchFocused: false,
  setSearchFocused: (focused) => set({ isSearchFocused: focused }),
}));
