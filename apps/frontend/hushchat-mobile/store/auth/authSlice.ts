import { StateCreator } from "zustand";
import { saveTokens, clearTokens, getAllTokens } from "@/utils/authUtils";
import axios from "axios";
import { AUTH_API_ENDPOINTS } from "@/constants/apiConstants";

export interface AuthState {
  userToken: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  hasHydrated: boolean;
  saveUserAuthData: (idToken: string, accessToken: string, refreshToken: string) => Promise<void>;
  setHasHydrated: (hydrated: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  userToken: null,
  isAuthenticated: false,
  hasHydrated: false,

  saveUserAuthData: async (idToken, accessToken, refreshToken) => {
    await saveTokens(idToken, accessToken, refreshToken);
    set({ userToken: idToken, isAuthenticated: true });
  },

  setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

  logout: async () => {
    try {
      const accessToken = (await getAllTokens()).accessToken;
      if (accessToken) {
        await axios.post(AUTH_API_ENDPOINTS.LOGOUT(accessToken));
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      await clearTokens();
      set({ userToken: null, isAuthenticated: false });
    }
  },
});
