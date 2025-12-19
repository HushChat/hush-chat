import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import { Platform } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import {
  checkBiometricAvailability,
  getBiometricTypeName,
  isBiometricLoginEnabled,
  performBiometricLogin,
  enableBiometricLogin,
} from "@/utils/biometricAuthUtils";

const loginSchema = yup.object({
  email: yup.string().trim().email("Invalid email address").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function useLoginForm() {
  const { errorMessage, setErrorMessage, handleLogin } = useAuth();

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } = useForm(
    loginSchema,
    { email: "", password: "" }
  );

  /* ------------------ BIOMETRIC STATE ------------------ */
  // 🛡️ Fix: Initialize with safe default values, never null
  const [biometricInfo, setBiometricInfo] = useState<{
    isAvailable: boolean;
    label: string;
  }>({
    isAvailable: false,
    label: "",
  });

  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /* ------------------ INIT BIOMETRICS ------------------ */
  useEffect(() => {
    // 🛡️ WEB GUARD: Skip effect entirely on web
    if (Platform.OS === "web") return;

    let mounted = true;

    const checkBio = async () => {
      try {
        const availability = await checkBiometricAvailability();
        const enabled = await isBiometricLoginEnabled();

        if (mounted) {
          setBiometricInfo({
            isAvailable: availability.isAvailable,
            // Fallback to "Biometrics" if type name fails
            label: getBiometricTypeName(availability.supportedTypes) || "Biometrics",
          });
          setIsBiometricEnabled(enabled);
        }
      } catch (e) {
        console.error("Biometric init failed", e);
      }
    };

    checkBio();
    return () => {
      mounted = false;
    };
  }, []);

  /* ------------------ NORMAL LOGIN ------------------ */
  const submit = useCallback(async () => {
    setShowErrors(true);
    setErrorMessage("");

    const clean = await validateAll();
    if (!clean) return;

    try {
      await handleLogin(clean.email, clean.password);

      // 🛡️ WEB GUARD: Skip secure storage on web
      if (Platform.OS !== "web" && biometricInfo.isAvailable && !isBiometricEnabled) {
        // Optional: Ask user before enabling, or do it silently?
        // For now, we attempt to save it if available.
        await enableBiometricLogin(clean.email, clean.password);
        setIsBiometricEnabled(true);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }, [
    validateAll,
    handleLogin,
    biometricInfo.isAvailable,
    isBiometricEnabled,
    setErrorMessage,
    setShowErrors,
  ]);

  /* ------------------ BIOMETRIC LOGIN ------------------ */
  const handleBiometricLogin = useCallback(async () => {
    // 🛡️ WEB GUARD
    if (Platform.OS === "web") return;

    try {
      setIsAuthenticating(true);
      setErrorMessage("");

      const result = await performBiometricLogin("Login using biometrics");

      if (!result.success || !result.credentials) {
        // Don't show error if user just canceled
        if (result.error !== "User canceled") {
          setErrorMessage(result.error || "Biometric login failed");
        }
        return;
      }

      await handleLogin(result.credentials.email, result.credentials.password);
    } catch {
      setErrorMessage("Biometric authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  }, [handleLogin, setErrorMessage]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
    biometricInfo, // Will never be undefined now
    isBiometricEnabled,
    isAuthenticating,
    handleBiometricLogin,
  };
}
