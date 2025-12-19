import { getUserInfo } from "@/apis/user";
import { IUser } from "@/types/user/types";
import { logInfo } from "@/utils/logger";
import { StateCreator } from "zustand";
import { getDeviceType } from "@/utils/commonUtils";

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
  workspaceName: "",
  workspaceRole: "",
  deviceType: null,
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

      const user: IUser = {
        ...response.data,
        workspaceRole: response.data.workspaceRole,
        deviceType: getDeviceType(),
      };

      set({
        user: user,
        loading: false,
        isAuthenticatedAndDataFetched: true,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch user data";
      logInfo("Error fetching user data:", errorMessage);
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
