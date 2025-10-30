/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useCallback } from "react";
import * as yup from "yup";
import { useRouter } from "expo-router";
import { useForm } from "@/hooks/useForm";

const workspaceSchema = yup.object({
  workspaceName: yup
    .string()
    .trim()
    .min(2, "Workspace name must be at least 2 characters")
    .required("Workspace name is required"),
});

export function useWorkspaceForm() {
  const router = useRouter();

  const {
    values,
    errors,
    showErrors,
    onValueChange,
    validateAll,
    setShowErrors,
  } = useForm(workspaceSchema, { workspaceName: "" });

  const handleNext = useCallback(async () => {
    setShowErrors(true);
    const clean = await validateAll();
    if (!clean) return;
    router.push("/login");
  }, [validateAll, router, setShowErrors]);

  return {
    formValues: values,
    formErrors: errors,
    showErrors,
    onValueChange,
    handleNext,
  };
}
