import { create } from "zustand";
import {
  createSearchSelectedMessageSlice,
  SearchState,
} from "@/store/search-message/useSearchMessageSlice";

export const useSearchSelectedMessageStore = create<SearchState>((set, get, store) => ({
  ...createSearchSelectedMessageSlice(set, get, store),
}));
