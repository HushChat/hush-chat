import { useCallback, useState } from "react";
import { router } from "expo-router";
import { IWorkspaceRegister, WorkspaceRegister } from "@/types/user/types";
import { registerWorkspaceUser } from "@/services/authService";
import { CHATS_PATH } from "@/constants/routes";
import { useForm } from "@/hooks/useForm";
import { useAuthStore } from "@/store/auth/authStore";

export function useWorkspaceRegisterForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setWorkspaceSelected } = useAuthStore();

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } =
    useForm<IWorkspaceRegister>(WorkspaceRegister, {
      imageIndexedName: "",
      firstName: "",
      lastName: "",
      username: "",
    });

  const submit = useCallback(async () => {
    setErrorMessage("");
    setShowErrors(true);
    setIsLoading(true);
    try {
      const validated = await validateAll();
      if (!validated) return;

      const response = await registerWorkspaceUser(validated);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }
      setWorkspaceSelected(true);
      router.push({ pathname: CHATS_PATH });
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
