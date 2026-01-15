import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function LoginScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit } =
    useLoginForm();

  return (
    <AuthWebLayout colors={colors} isDark={isDark}>
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
