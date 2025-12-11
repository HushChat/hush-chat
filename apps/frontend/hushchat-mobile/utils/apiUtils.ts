import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { AUTH_API_ENDPOINTS, TOKEN_TYPE } from "@/constants/apiConstants";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";
import { getAllTokens, isTokenExpiringSoon, refreshIdToken } from "@/utils/authUtils";
import { logError } from "@/utils/logger";
import { X_TENANT, X_UUID_HEADER } from "@/constants/constants";
import * as Crypto from "expo-crypto";

const getAPIBaseURL = () => {
  const host = getBuildConstant(BuildConstantKeys.API_HOST);
  const port = getBuildConstant(BuildConstantKeys.API_PORT);
  const protocol = getBuildConstant(BuildConstantKeys.API_PROTOCOL);
  const baseURL = port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
  return baseURL;
};

export const getWSBaseURL = () => {
  const host = getBuildConstant(BuildConstantKeys.API_HOST);
  const port = getBuildConstant(BuildConstantKeys.API_PORT);
  const protocol = getBuildConstant(BuildConstantKeys.WS_PROTOCOL);
  const baseURL = port ? `${protocol}://${host}:${port}` : `${protocol}://${host}`;
  return baseURL;
};

const PUBLIC_ENDPOINTS: string[] = [
  AUTH_API_ENDPOINTS.LOGIN,
  AUTH_API_ENDPOINTS.REFRESH_TOKEN,
  AUTH_API_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_API_ENDPOINTS.CONFIRM_FORGOT_PASSWORD,
  AUTH_API_ENDPOINTS.REGISTER,
  AUTH_API_ENDPOINTS.VERIFY_OTP,
  AUTH_API_ENDPOINTS.RESEND_OTP,
];

export const setAPIDefaults = () => {
  axios.defaults.baseURL = getAPIBaseURL();
};

/**
 * Checks if a given URL is a public endpoint.
 * @param url - The URL
 */
export function isPublicEndpoint(url?: string): boolean {
  if (!url) return false;

  return PUBLIC_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export const setupAuthorizationHeader = () => {
  // Request interceptor - adds auth token to requests
  axios.interceptors.request.use(
    async (
      config: InternalAxiosRequestConfig<unknown>
    ): Promise<InternalAxiosRequestConfig<unknown>> => {
      try {
        if (isPublicEndpoint(config.url)) {
          return config;
        }

        if (await isTokenExpiringSoon()) {
          await refreshIdToken();
        }

        const { idToken, workspace } = await getAllTokens();

        if (idToken) {
          config.headers.Authorization = `${TOKEN_TYPE} ${idToken}`;
        }
        if (workspace) {
          config.headers[X_TENANT] = workspace;
        }

        config.headers[X_UUID_HEADER] = Crypto.randomUUID();
      } catch (error) {
        logError("Error while setting up authorization header", error);
      }
      return config;
    },
    async (error: AxiosError) => Promise.reject(error)
  );
};

export default {};
