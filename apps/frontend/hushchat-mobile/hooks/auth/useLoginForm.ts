import { useCallback } from "react";
import * as yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";

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
  };
}
