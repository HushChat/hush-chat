/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { StateCreator } from "zustand";
import { saveTokens, clearTokens, getAllTokens } from "@/utils/authUtils";
import axios from "axios";
import { AUTH_API_ENDPOINTS } from "@/constants/apiConstants";

export interface AuthState {
  userToken: string | null;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  hasHydrated: boolean;
  saveUserAuthData: (
    idToken: string,
    accessToken: string,
    refreshToken: string,
  ) => Promise<void>;
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
