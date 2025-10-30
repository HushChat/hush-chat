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

import { useCallback, useState } from "react";
import { router } from "expo-router";
import { IRegisterUser, RegisterUser } from "@/types/user/types";
import { registerUser } from "@/services/authService";
import { VERIFY_OTP_PATH } from "@/constants/routes";
import { useForm } from "@/hooks/useForm";

export function useRegisterForm() {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    values,
    errors,
    showErrors,
    onValueChange,
    validateAll,
    setShowErrors,
  } = useForm<IRegisterUser>(RegisterUser, {
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
