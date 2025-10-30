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

import { getUserInfo } from "@/apis/user";
import { IUser } from "@/types/user/types";
import { StateCreator } from "zustand";

export interface UserState {
  user: IUser;
  loading: boolean;
  error: string | null;
  isAuthenticatedAndDataFetched: boolean;
  setIsLoading: (value: boolean) => void;
  setIsAuthenticatedAndDataFetched: (value: boolean) => void;
  fetchUserData: () => Promise<void>;
  resetState: () => void;
}

const initialUserState: IUser = {
  id: "",
  email: "",
  firstName: "",
  lastName: "",
  signedImageUrl: "",
  active: false,
};

export const createUserSlice: StateCreator<UserState> = (set) => ({
  user: initialUserState,
  loading: false,
  error: null,
  isAuthenticatedAndDataFetched: false,

  setIsLoading: (value: boolean) => {
    set({ loading: value });
  },

  setIsAuthenticatedAndDataFetched: (value: boolean) => {
    set({ isAuthenticatedAndDataFetched: value });
  },

  fetchUserData: async () => {
    set({ loading: true, error: null });

    try {
      const response = await getUserInfo();

      if (response.error) {
        set({
          error: response.error,
          loading: false,
          isAuthenticatedAndDataFetched: false,
        });
        return;
      }

      if (!response.data) {
        set({
          error: "Invalid user data received",
          loading: false,
          isAuthenticatedAndDataFetched: false,
        });
        return;
      }

      set({
        user: response.data,
        loading: false,
        isAuthenticatedAndDataFetched: true,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";
      console.error("Error fetching user data:", errorMessage);
      set({
        error: errorMessage,
        loading: false,
        isAuthenticatedAndDataFetched: false,
      });
    }
  },

  resetState: () => {
    set({
      user: initialUserState,
      loading: false,
      error: null,
      isAuthenticatedAndDataFetched: false,
    });
  },
});
