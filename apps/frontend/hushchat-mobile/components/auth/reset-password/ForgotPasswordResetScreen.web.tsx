import React from "react";
import { useWindowDimensions } from "react-native";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useForgotPasswordReset } from "@/hooks/auth/useForgotPasswordReset";
import { ForgotPasswordResetForm } from "@/components/auth/reset-password/ForgotPasswordResetForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function ForgotPasswordResetScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

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
    <AuthWebLayout
      colors={colors}
      isDark={isDark}
      heroTitle="You're one step away from a fresh start."
      heroSubtitle="Create a strong, unique password to keep your account secure. Once reset, you'll be back to chatting with your team in no time."
      features={[]}
    >
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
        stretch={isMobile}
      />
    </AuthWebLayout>
  );
}
