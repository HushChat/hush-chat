import { useCallback, useState } from "react";
import { router } from "expo-router";
import { CreateWorkspace, ICreateWorkspace } from "@/types/user/types";
import { createWorkspace } from "@/services/authService";
import { WORKSPACE_REGISTER_PATH } from "@/constants/routes";
import { useForm } from "@/hooks/useForm";
import { useSaveWorkspace } from "@/hooks/auth/useSaveWorkspace";

export function useCreateWorkspaceForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { saveWorkspace } = useSaveWorkspace();

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } =
    useForm<ICreateWorkspace>(CreateWorkspace, {
      name: "",
      description: "",
      imageUrl: "",
    });

  const submit = useCallback(async () => {
    setErrorMessage("");
    setShowErrors(true);
    setIsLoading(true);
    try {
      const validated = await validateAll();
      if (!validated) return;

      const response = await createWorkspace(validated);
      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      await saveWorkspace(validated.name);
      router.push(WORKSPACE_REGISTER_PATH);
    } catch (err: any) {
      setErrorMessage(err?.message || "Workspace create failed.");
    } finally {
      setIsLoading(false);
    }
  }, [setShowErrors, validateAll, saveWorkspace]);

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
