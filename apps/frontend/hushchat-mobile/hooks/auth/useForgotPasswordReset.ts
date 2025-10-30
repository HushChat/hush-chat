import { useEffect, useState, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import * as yup from "yup";
import { useForm } from "@/hooks/useForm";

const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
  code: yup.string().trim().required("Verification code is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Min 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export function useForgotPasswordReset() {
  const { email: routeEmail } = useLocalSearchParams();
  const emailParam = Array.isArray(routeEmail)
    ? routeEmail[0]
    : (routeEmail as string | undefined);

  const {
    values,
    errors,
    showErrors,
    onValueChange,
    validateAll,
    setShowErrors,
  } = useForm(resetPasswordSchema, {
    email: emailParam ?? "",
    code: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailParam)
      setSuccessMessage("Reset code has been sent to your email!");
  }, [emailParam]);

  const onSubmit = useCallback(async () => {
    setShowErrors(true);
    setErrorMessage(null);

    const clean = await validateAll();
    if (!clean) return;

    try {
      setLoading(true);
      await axios.post("/public/user/auth/confirm-forgot-password", {
        email: clean.email,
        code: clean.code,
        password: clean.password,
      });
      router.replace("/login");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reset password",
      );
    } finally {
      setLoading(false);
    }
  }, [validateAll, setShowErrors]);

  const onBackToLogin = useCallback(() => router.replace("/login"), []);

  return {
    loading,
    errorMessage,
    successMessage,
    formValues: values,
    formErrors: errors,
    showErrors,
    onValueChange,
    onSubmit,
    onBackToLogin,
  };
}
