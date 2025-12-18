import { useCallback } from "react";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth/authStore";
import { AUTH_LOGIN_PATH } from "@/constants/routes";

const LOGOUT_DELAY_MS = 300;

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();

  const handleLogout = useCallback(async () => {
    queryClient.clear();
    await logout();
    // ⚠️ Temporary workaround: Wait for storage to finish properly before navigating
    await new Promise((resolve) => setTimeout(resolve, LOGOUT_DELAY_MS));
    router.replace(AUTH_LOGIN_PATH);
  }, [logout, queryClient]);

  return { handleLogout };
}
