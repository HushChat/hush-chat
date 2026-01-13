import React from "react";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function RegisterScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useRegisterForm();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
      <RegisterForm
        colors={colors}
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
        stretch={true}
      />
    </AuthMobileLayout>
  );
}
