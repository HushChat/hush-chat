import { useState, useCallback } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useRouter } from "expo-router";
import { loginUser } from "@/services/authService";
import { AUTH_WORKSPACE_FORM_PATH, VERIFY_OTP_PATH } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { USER_NOT_CONFIRMED_ERROR } from "@/constants/constants";

export function useAuth() {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const saveUserAuthData = useAuthStore((state) => state.saveUserAuthData);
  const queryClient = useQueryClient();

  const handleLoginSuccess = useCallback(
    async (idToken: string, accessToken: string, refreshToken: string) => {
      await saveUserAuthData(idToken, accessToken, refreshToken);

      await new Promise((resolve) => setTimeout(resolve, 300));

      router.replace(AUTH_WORKSPACE_FORM_PATH);
    },
    [saveUserAuthData, router]
  );

  const handleLogin = async (username: string, password: string) => {
    queryClient.clear();
    setErrorMessage("");

    const response = await loginUser(username, password);

    if (!response.success) {
      if (response.message === USER_NOT_CONFIRMED_ERROR) {
        router.push({ pathname: VERIFY_OTP_PATH, params: { email: username } });
        return;
      }
      setErrorMessage(response.message);
      return;
    }

    await handleLoginSuccess(response.idToken, response.accessToken, response.refreshToken);
  };

  return {
    errorMessage,
    setErrorMessage,
    handleLogin,
    handleLoginSuccess,
  };
}
