import { create } from 'zustand';
import { createUserSlice, UserState } from '@/store/user/useUserSlice';

export const useUserStore = create<UserState>((set, get, store) => ({
  ...createUserSlice(set, get, store),
}));
