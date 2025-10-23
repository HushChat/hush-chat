import { useCallback } from 'react';
import * as yup from 'yup';
import { useRouter } from 'expo-router';
import { useForm } from '@/hooks/useForm';

const workspaceSchema = yup.object({
  workspaceName: yup
    .string()
    .trim()
    .min(2, 'Workspace name must be at least 2 characters')
    .required('Workspace name is required'),
});

export function useWorkspaceForm() {
  const router = useRouter();

  const { values, errors, showErrors, onValueChange, validateAll, setShowErrors } = useForm(
    workspaceSchema,
    { workspaceName: '' },
  );

  const handleNext = useCallback(async () => {
    setShowErrors(true);
    const clean = await validateAll();
    if (!clean) return;
    router.push('/login');
  }, [validateAll, router, setShowErrors]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    onValueChange,
    handleNext,
  };
}
