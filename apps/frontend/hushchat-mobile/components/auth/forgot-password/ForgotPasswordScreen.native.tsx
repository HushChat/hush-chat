import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
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
        stretch={true}
      />
    </AuthMobileLayout>
  );
}
