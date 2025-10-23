import { getUserInfo } from '@/apis/user';
import { IUser } from '@/types/user/types';
import { StateCreator } from 'zustand';

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
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  signedImageUrl: '',
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
          error: 'Invalid user data received',
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user data';
      console.error('Error fetching user data:', errorMessage);
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
