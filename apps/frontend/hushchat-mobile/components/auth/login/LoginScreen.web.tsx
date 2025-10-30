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
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function LoginScreen() {
  const { colors } = useAuthThemeColors();
  const {
    formValues,
    formErrors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
  } = useLoginForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Welcome!"
      subtitle="Streamline conversations. Boost productivity."
      image={Images.LoginPeople}
    >
      <LoginForm
        colors={colors}
        errorMessage={errorMessage}
        onSubmit={submit}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
      />
    </AuthWebLayout>
  );
}
