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

import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import * as yup from "yup";
import { sendForgotPasswordCode } from "@/services/forgotPasswordService";
import {
  AUTH_LOGIN_PATH,
  AUTH_FORGOT_PASSWORD_RESET_PATH,
} from "@/constants/routes";
import { useForm } from "@/hooks/useForm";

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email address")
    .required("Please enter your email address"),
});

export function useForgotPassword() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { values, onValueChange, validateAll, setShowErrors } = useForm(
    forgotPasswordSchema,
    {
      email: "",
    },
  );

  const handleSendCode = useCallback(async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setShowErrors(true);

    const clean = await validateAll();
    if (!clean) return;

    try {
      setLoading(true);
      const response = await sendForgotPasswordCode(clean.email.trim());
      if (response.success) {
        setSuccessMessage("Verification code sent! Check your email.");
        setTimeout(() => {
          router.push({
            pathname: AUTH_FORGOT_PASSWORD_RESET_PATH,
            params: { email: clean.email.trim() },
          });
        }, 1000);
      } else {
        setErrorMessage(response.message);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [validateAll, router, setShowErrors]);

  const goBackToLogin = useCallback(() => {
    router.replace(AUTH_LOGIN_PATH);
  }, [router]);

  const clearMessages = useCallback(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, []);

  return {
    email: values.email,
    setEmail: (value: string) => onValueChange({ name: "email", value: value }),
    errorMessage,
    successMessage,
    loading,
    handleSendCode,
    goBackToLogin,
    clearMessages,
  };
}
