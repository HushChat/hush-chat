import { useCallback, useState } from "react";
import { router } from "expo-router";
import { IRegisterUser, RegisterUser } from "@/types/user/types";
import { registerUser } from "@/services/authService";
import { VERIFY_OTP_PATH } from "@/constants/routes";
import { useForm } from "@/hooks/useForm";

export function useRegisterForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } =
    useForm<IRegisterUser>(RegisterUser, {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      imageIndexedName: "",
    });

  const submit = useCallback(async () => {
    setErrorMessage("");
    setShowErrors(true);
    setIsLoading(true);
    try {
      const validated = await validateAll();
      if (!validated) return;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...payload } = validated;
      const response = await registerUser(payload);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }
      router.push({
        pathname: VERIFY_OTP_PATH,
        params: { email: validated.email },
      });
    } catch (err: any) {
      setErrorMessage(err?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  }, [validateAll, setShowErrors]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
    isLoading,
  };
}
