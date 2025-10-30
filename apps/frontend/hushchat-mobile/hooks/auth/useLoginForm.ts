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
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "@/hooks/useForm";

const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function useLoginForm() {
  const { errorMessage, setErrorMessage, handleLogin } = useAuth();

  const {
    values,
    errors,
    showErrors,
    onValueChange,
    validateAll,
    setShowErrors,
  } = useForm(loginSchema, { email: "", password: "" });

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
