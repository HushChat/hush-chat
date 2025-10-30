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
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function RegisterScreen() {
  const { colors } = useAuthThemeColors();
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
    <AuthWebLayout
      colors={colors}
      title="Create your account"
      subtitle="Join your team workspace and start collaborating. It takes less than a minute."
      image={Images.Workspace}
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
    </AuthWebLayout>
  );
}
