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

import axios, { AxiosError, AxiosResponse } from "axios";
import { ToastUtils } from "@/utils/toastUtils";
import { router } from "expo-router";
import { AUTH_WORKSPACE_FORM_PATH } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/authStore";

let isLoggingOut = false;
const safeLogoutAndRedirect = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  const { logout } = useAuthStore.getState();
  Promise.resolve(logout())
    .catch(() => {})
    .finally(() => {
      router.replace(AUTH_WORKSPACE_FORM_PATH);
      // small debounce to allow navigation to settle before allowing another logout
      setTimeout(() => {
        isLoggingOut = false;
      }, 300);
    });
};

export interface ErrorResponseWithMessage {
  message?: string;
}

export interface ErrorResponseWithErrorString {
  error?: string;
}

export interface ErrorResponseWithErrorObject {
  error?: {
    message?: string;
    [key: string]: unknown;
  };
}

export interface ErrorResponseWithDetail {
  detail?: string;
}

export type ErrorResponse = ErrorResponseWithMessage &
  ErrorResponseWithErrorString &
  ErrorResponseWithErrorObject &
  ErrorResponseWithDetail;

const extractErrorMessage = (responseData: ErrorResponse): string => {
  if (!responseData) return "Unknown error";

  return (
    responseData.message ||
    responseData.error?.message ||
    responseData.detail ||
    responseData.error ||
    "Unknown error"
  );
};

export const setupGlobalErrorHandling = () => {
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      let errorMessage = "An unknown error occurred";

      if (error.response) {
        const responseData = error.response.data as ErrorResponse;
        const statusCode = error.response.status;
        if (responseData) {
          errorMessage = extractErrorMessage(responseData);
        }

        if (statusCode === 401 || statusCode === 403) {
          ToastUtils.error(
            "Session Expired",
            "Your session has expired. Logging out...",
          );
          safeLogoutAndRedirect();
          return Promise.reject(error);
        }
      } else if (error.request) {
        // The request was made but no response was received (network issues)
        errorMessage = "Network error. Please check your connection.";
      } else {
        // Something happened in setting up the request
        // Here, the error is still AxiosError, so error.message should be fine
        errorMessage = error.message || "Error preparing request";
      }
      ToastUtils.error("Error!", errorMessage);
      return Promise.reject(error);
    },
  );
};
