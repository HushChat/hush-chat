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
