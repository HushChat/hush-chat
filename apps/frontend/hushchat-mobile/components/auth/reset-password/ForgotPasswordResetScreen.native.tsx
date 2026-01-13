import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useForgotPasswordReset } from "@/hooks/auth/useForgotPasswordReset";
import { ForgotPasswordResetForm } from "@/components/auth/reset-password/ForgotPasswordResetForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function ForgotPasswordResetScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const {
    errorMessage,
    successMessage,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
    onSubmit,
    onBackToLogin,
  } = useForgotPasswordReset();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
      <ForgotPasswordResetForm
        colors={colors}
        errorMessage={errorMessage}
        successMessage={successMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onBackToLogin={onBackToLogin}
        stretch={true}
      />
    </AuthMobileLayout>
  );
}
