import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function LoginScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit } =
    useLoginForm();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
      <LoginForm
        colors={colors}
        errorMessage={errorMessage}
        onSubmit={submit}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
      />
    </AuthMobileLayout>
  );
}
