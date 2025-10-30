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

import React from "react";
import { useRouter } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function RegisterScreen() {
  const { colors } = useAuthThemeColors();
  const router = useRouter();
  const {
    formValues,
    formErrors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
    isLoading,
  } = useRegisterForm();

  return (
    <AuthMobileLayout
      colors={colors}
      image={Images.Workspace}
      onBack={() => router.back()}
    >
      <RegisterForm
        colors={colors}
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
      />
    </AuthMobileLayout>
  );
}
