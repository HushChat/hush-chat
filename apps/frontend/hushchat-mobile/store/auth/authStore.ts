import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAuthSlice, AuthState } from "./authSlice";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get, api) => ({
      ...createAuthSlice(set, get, api),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
