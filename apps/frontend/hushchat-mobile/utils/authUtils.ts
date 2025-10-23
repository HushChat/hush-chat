import { StorageFactory } from '@/utils/storage/storageFactory';
import { USER_TOKEN_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/constants/constants';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { AUTH_API_ENDPOINTS } from '@/constants/apiConstants';
import { ToastUtils } from '@/utils/toastUtils';

const storage = StorageFactory.createStorage();

interface DecodedToken {
  exp: number; // Expiry time in seconds
  iat: number; // Issued time in seconds
}

/**
 * Retrieves all authentication tokens from storage.
 */
export async function getAllTokens(): Promise<{
  idToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const [idToken, accessToken, refreshToken] = await Promise.all([
      storage.get<string>(USER_TOKEN_KEY),
      storage.get<string>(ACCESS_TOKEN_KEY),
      storage.get<string>(REFRESH_TOKEN_KEY),
    ]);

    return {
      idToken: idToken || null,
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
    };
  } catch (error) {
    console.warn('Error reading tokens from AsyncStorage:', error);
    return {
      idToken: null,
      accessToken: null,
      refreshToken: null,
    };
  }
}

/**
 * Saves any combination of authentication tokens (ID, access, refresh) to storage.
 */
export async function saveTokens(
  idToken?: string,
  accessToken?: string,
  refreshToken?: string,
): Promise<void> {
  const savePromises = [];
  if (idToken) {
    savePromises.push(storage.save(USER_TOKEN_KEY, idToken));
  }
  if (accessToken) {
    savePromises.push(storage.save(ACCESS_TOKEN_KEY, accessToken));
  }
  if (refreshToken) {
    savePromises.push(storage.save(REFRESH_TOKEN_KEY, refreshToken));
  }
  if (savePromises.length > 0) {
    await Promise.all(savePromises);
  }
}

/**
 * Clears all authentication tokens (ID, access, refresh) from storage.
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    storage.remove(USER_TOKEN_KEY),
    storage.remove(ACCESS_TOKEN_KEY),
    storage.remove(REFRESH_TOKEN_KEY),
  ]);
}

/**
 * Checks if the ID token is close to expiration.
 * @returns {Promise<boolean>} - True if token needs refresh.
 */
export async function isTokenExpiringSoon(): Promise<boolean> {
  const { idToken } = await getAllTokens();
  if (!idToken) return true; // No token means refresh is needed

  try {
    const decoded: DecodedToken = jwtDecode(idToken);
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
    const expiryThreshold = 60 * 2; // Refresh 2 minutes before expiry
    return decoded.exp - currentTime <= expiryThreshold;
  } catch (error) {
    console.warn('Error decoding token:', error);
    return true; // If decoding fails, assume it's expired
  }
}

/**
 * Refreshes the ID token using the refresh token.
 * @returns {Promise<string | null>} - The new ID token or null if refresh fails.
 */
export async function refreshIdToken(): Promise<string | null> {
  const { refreshToken } = await getAllTokens();
  if (!refreshToken) {
    ToastUtils.error('No refresh token available. Please log in again.');
    return null;
  }

  try {
    const response = await axios.post(AUTH_API_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken: refreshToken,
    });

    const { idToken, accessToken, refreshToken: newRefreshToken } = response.data;

    if (idToken) {
      await saveTokens(idToken, accessToken, newRefreshToken);
      return idToken;
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
  }

  return null;
}

export interface DecodedJWTPayload {
  sub: string;
  username: string;
  exp: number;
  [key: string]: any;
}

export const decodeJWTToken = (token: string): DecodedJWTPayload => {
  const decoded = jwtDecode(token) as DecodedJWTPayload;
  return decoded;
};
