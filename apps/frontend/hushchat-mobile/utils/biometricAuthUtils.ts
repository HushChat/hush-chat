import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { logInfo, logError, logWarn } from "@/utils/logger";

// Secure storage keys
const BIOMETRIC_ENABLED_KEY = "biometric_auth_enabled";
const STORED_EMAIL_KEY = "biometric_stored_email";
const STORED_PASSWORD_KEY = "biometric_stored_password";

export interface BiometricType {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  hasHardware: boolean;
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export async function checkBiometricAvailability(): Promise<BiometricType> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    return {
      isAvailable: hasHardware && isEnrolled,
      supportedTypes,
      hasHardware,
      isEnrolled,
    };
  } catch (error) {
    logError("Error checking biometric availability:", error);
    return {
      isAvailable: false,
      supportedTypes: [],
      hasHardware: false,
      isEnrolled: false,
    };
  }
}

/**
 * Get a user-friendly name for the biometric type
 */
export function getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return "Face ID";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return "Touch ID";
  }
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return "Iris Recognition";
  }
  return "Biometric Authentication";
}

/**
 * Authenticate user with biometrics or device credentials
 */
export async function authenticateWithBiometrics(
  promptMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const biometricAuth = await checkBiometricAvailability();

    if (!biometricAuth.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication is not available on this device",
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || "Authenticate to login",
      fallbackLabel: "Use Password",
      disableDeviceFallback: false, // Allow device PIN/Pattern fallback
      cancelLabel: "Cancel",
    });

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error: result.error || "Authentication failed",
    };
  } catch (error) {
    logError("Biometric authentication error:", error);
    return {
      success: false,
      error: "An error occurred during authentication",
    };
  }
}

/**
 * Check if biometric login is enabled
 */
export async function isBiometricLoginEnabled(): Promise<boolean> {
  try {
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  } catch (error) {
    logWarn("Error checking biometric login status:", error);
    return false;
  }
}

/**
 * Enable biometric login and store credentials securely
 */
export async function enableBiometricLogin(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First verify biometrics work
    const authResult = await authenticateWithBiometrics(
      "Verify your identity to enable biometric login"
    );

    if (!authResult.success) {
      return authResult;
    }

    // Store credentials securely
    await SecureStore.setItemAsync(STORED_EMAIL_KEY, email);
    await SecureStore.setItemAsync(STORED_PASSWORD_KEY, password);
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");

    logInfo("Biometric login enabled successfully");
    return { success: true };
  } catch (error) {
    logError("Error enabling biometric login:", error);
    return {
      success: false,
      error: "Failed to enable biometric login",
    };
  }
}

/**
 * Disable biometric login and clear stored credentials
 */
export async function disableBiometricLogin(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORED_EMAIL_KEY);
    await SecureStore.deleteItemAsync(STORED_PASSWORD_KEY);
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    logInfo("Biometric login disabled");
  } catch (error) {
    logError("Error disabling biometric login:", error);
  }
}

/**
 * Get stored credentials if biometric login is enabled
 */
export async function getStoredCredentials(): Promise<{
  email: string | null;
  password: string | null;
} | null> {
  try {
    const isEnabled = await isBiometricLoginEnabled();
    if (!isEnabled) {
      return null;
    }

    const email = await SecureStore.getItemAsync(STORED_EMAIL_KEY);
    const password = await SecureStore.getItemAsync(STORED_PASSWORD_KEY);

    if (!email || !password) {
      // Credentials missing, disable biometric login
      await disableBiometricLogin();
      return null;
    }

    return { email, password };
  } catch (error) {
    logError("Error retrieving stored credentials:", error);
    return null;
  }
}

/**
 * Perform biometric login (authenticate + retrieve credentials)
 */
export async function performBiometricLogin(promptMessage?: string): Promise<{
  success: boolean;
  credentials?: { email: string; password: string };
  error?: string;
}> {
  try {
    // Check if biometric login is enabled
    const isEnabled = await isBiometricLoginEnabled();
    if (!isEnabled) {
      return {
        success: false,
        error: "Biometric login is not enabled",
      };
    }

    // Authenticate with biometrics
    const authResult = await authenticateWithBiometrics(promptMessage);
    if (!authResult.success) {
      return authResult;
    }

    // Retrieve stored credentials
    const credentials = await getStoredCredentials();
    if (!credentials || !credentials.email || !credentials.password) {
      return {
        success: false,
        error: "Stored credentials not found",
      };
    }

    return {
      success: true,
      credentials: {
        email: credentials.email,
        password: credentials.password,
      },
    };
  } catch (error) {
    logError("Error performing biometric login:", error);
    return {
      success: false,
      error: "Biometric login failed",
    };
  }
}
