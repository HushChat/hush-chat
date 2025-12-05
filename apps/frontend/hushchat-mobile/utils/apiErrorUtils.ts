import axios, { AxiosError, AxiosResponse } from "axios";
import { ToastUtils } from "@/utils/toastUtils";
import { router } from "expo-router";
import { AUTH_LOGIN_PATH } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/authStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

let isLoggingOut = false;
const safeLogoutAndRedirect = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  const { logout } = useAuthStore.getState();
  Promise.resolve(logout())
    .catch(() => {})
    .finally(() => {
      router.replace(AUTH_LOGIN_PATH);
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

        if (statusCode === 401 || statusCode === 403 || statusCode === 430) {
          ToastUtils.error("Session Expired", "Your session has expired. Logging out...");
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

      if (!error.config?.skipErrorToast) {
        ToastUtils.error("Error!", errorMessage);
      }

      return Promise.reject(error);
    }
  );
};
