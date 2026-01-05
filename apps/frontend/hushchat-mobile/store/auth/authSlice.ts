import { StateCreator } from "zustand";
import { saveTokens, clearTokens } from "@/utils/authUtils";
import { logInfo } from "@/utils/logger";

export interface AuthState {
  userToken: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  hasHydrated: boolean;
  saveUserAuthData: (idToken: string, accessToken: string, refreshToken: string) => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
  isWorkspaceSelected: boolean;
  setWorkspaceSelected: (selected: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  userToken: null,
  isAuthenticated: false,
  hasHydrated: false,
  isWorkspaceSelected: false,

  saveUserAuthData: async (idToken, accessToken, refreshToken) => {
    await saveTokens(idToken, accessToken, refreshToken);
    set({ userToken: idToken, isAuthenticated: true, isWorkspaceSelected: false });
  },

  setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

  logout: async () => {
    try {
      await clearTokens(true);
      set({ userToken: null, isAuthenticated: false, isWorkspaceSelected: false });
    } catch (e) {
      logInfo("Error clearing local tokens", e);
    }
  },

  setWorkspaceSelected: (selected) => set({ isWorkspaceSelected: selected }),
});
