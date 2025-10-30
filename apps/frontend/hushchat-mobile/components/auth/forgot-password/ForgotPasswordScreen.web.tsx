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
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function ForgotPasswordScreen() {
  const { colors } = useAuthThemeColors();
  const {
    email,
    setEmail,
    errorMessage,
    successMessage,
    handleSendCode,
    goBackToLogin,
  } = useForgotPassword();

  return (
    <AuthWebLayout
      colors={colors}
      title="Forgot your password?"
      subtitle="No stress. Enter your email and we’ll send a one-time code to help you get back in."
      image={Images.LoginPeople}
    >
      <ForgotPasswordForm
        colors={colors}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onSubmit={handleSendCode}
        onBackToLogin={goBackToLogin}
        formValues={{ email }}
        formErrors={{}}
        showErrors={false}
        onValueChange={({ name, value }) => {
          if (name === "email") setEmail(value);
        }}
      />
    </AuthWebLayout>
  );
}
