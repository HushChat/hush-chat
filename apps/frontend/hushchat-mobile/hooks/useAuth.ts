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

import { useState } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { useRouter } from "expo-router";
import { loginUser } from "@/services/authService";
import { CHATS_PATH, VERIFY_OTP_PATH } from "@/constants/routes";
import { useQueryClient } from "@tanstack/react-query";
import { USER_NOT_CONFIRMED_ERROR } from "@/constants/constants";

export function useAuth() {
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const saveUserAuthData = useAuthStore((state) => state.saveUserAuthData);
  const queryClient = useQueryClient();

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

    await saveUserAuthData(
      response.idToken,
      response.accessToken,
      response.refreshToken,
    );

    // small delay to ensure storage flushes on slower devices
    await new Promise((resolve) => setTimeout(resolve, 300));

    router.replace(CHATS_PATH);
  };

  return {
    errorMessage,
    setErrorMessage,
    handleLogin,
  };
}
