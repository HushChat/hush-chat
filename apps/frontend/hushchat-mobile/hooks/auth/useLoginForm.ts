import { useCallback, useEffect, useState } from "react";
import * as yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";
import { useBiometrics } from "@/hooks/useBiometrics";
import { getAllTokens, refreshIdToken } from "@/utils/authUtils";

const loginSchema = yup.object({
  email: yup.string().trim().email("Invalid email address").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function useLoginForm() {
  const { errorMessage, setErrorMessage, handleLogin, handleLoginSuccess } = useAuth();
  const { isBiometricSupported, promptBiometrics } = useBiometrics();
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } = useForm(
    loginSchema,
    { email: "", password: "" }
  );

  useEffect(() => {
    (async () => {
      if (!isBiometricSupported) return;
      const { refreshToken } = await getAllTokens();
      setCanUseBiometrics(!!refreshToken);
    })();
  }, [isBiometricSupported]);

  const handleBiometricLogin = useCallback(async () => {
    setErrorMessage("");

    const success = await promptBiometrics();
    if (!success) return;

    try {
      const newIdToken = await refreshIdToken();

      if (newIdToken) {
        const { accessToken, refreshToken } = await getAllTokens();

        if (accessToken && refreshToken) {
          await handleLoginSuccess(newIdToken, accessToken, refreshToken);
        } else {
          setErrorMessage("Session invalid. Please login manually.");
        }
      } else {
        setErrorMessage("Session expired. Please login manually.");
      }
    } catch {
      setErrorMessage("Authentication failed.");
    }
  }, [promptBiometrics, refreshIdToken, handleLoginSuccess, setErrorMessage]);

  const submit = useCallback(async () => {
    setShowErrors(true);
    setErrorMessage("");
    const clean = await validateAll();
    if (!clean) return;
    try {
      await handleLogin(clean.email, clean.password);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    }
  }, [validateAll, handleLogin, setErrorMessage, setShowErrors]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
    canUseBiometrics,
    handleBiometricLogin,
  };
}
