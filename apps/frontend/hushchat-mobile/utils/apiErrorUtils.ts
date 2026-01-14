import axios, { AxiosError, AxiosResponse, isAxiosError } from "axios";
import { ToastUtils } from "@/utils/toastUtils";
import { router } from "expo-router";
import { AUTH_LOGIN_PATH } from "@/constants/routes";
import { useAuthStore } from "@/store/auth/authStore";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CUSTOM_AUTH_ERROR: 430,
} as const;

export const isNotFoundError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.response?.status === HTTP_STATUS.NOT_FOUND;
  }
  return false;
};

export const isForbiddenError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.response?.status === HTTP_STATUS.FORBIDDEN;
  }
  return false;
};

export const isBadRequestError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return error.response?.status === HTTP_STATUS.BAD_REQUEST;
  }
  return false;
};

export const isAccessDeniedError = (error: unknown): boolean => {
  return isNotFoundError(error) || isForbiddenError(error);
};

export const getErrorStatusCode = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

export const skipRetryOn404 = (failureCount: number, error: unknown): boolean => {
  if (isNotFoundError(error)) {
    return false;
  }
  return failureCount < 3;
};

export const skipRetryOnAccessDenied = (failureCount: number, error: unknown): boolean => {
  if (isAccessDeniedError(error)) {
    return false;
  }
  return failureCount < 3;
};

export const skipRetryOnClientError = (failureCount: number, error: unknown): boolean => {
  const statusCode = getErrorStatusCode(error);
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return false;
  }
  return failureCount < 3;
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

  if (typeof responseData.error === "string") {
    return responseData.error;
  }

  return responseData.message || responseData.detail || responseData.error || "Unknown error";
};

export const getAPIErrorMessage = (error: unknown, fallback = "An error occurred"): string => {
  if (isAxiosError(error)) {
    const responseData = error.response?.data as ErrorResponse;
    if (responseData) {
      return extractErrorMessage(responseData);
    }
    if (error.request) {
      return "Network error. Please check your connection.";
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

let isLoggingOut = false;

const safeLogoutAndRedirect = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  const { logout } = useAuthStore.getState();
  Promise.resolve(logout())
    .catch(() => {})
    .finally(() => {
      router.replace(AUTH_LOGIN_PATH);
      setTimeout(() => {
        isLoggingOut = false;
      }, 300);
    });
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

        // Handle auth errors - redirect to login
        if (
          statusCode === HTTP_STATUS.UNAUTHORIZED ||
          statusCode === HTTP_STATUS.FORBIDDEN ||
          statusCode === HTTP_STATUS.CUSTOM_AUTH_ERROR
        ) {
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
