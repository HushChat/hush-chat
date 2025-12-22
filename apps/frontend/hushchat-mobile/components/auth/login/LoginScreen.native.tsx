import React from "react";
import { useRouter } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function LoginScreen() {
  const { colors } = useAuthThemeColors();
  const router = useRouter();

  const {
    formValues,
    formErrors,
    showErrors,
    errorMessage,
    onValueChange,
    submit,
    canUseBiometrics,
    handleBiometricLogin,
  } = useLoginForm();

  return (
    <AuthMobileLayout colors={colors} image={Images.LoginPeople} onBack={() => router.back()}>
      <LoginForm
        colors={colors}
        errorMessage={errorMessage}
        onSubmit={submit}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        canUseBiometrics={canUseBiometrics}
        onBiometricLogin={handleBiometricLogin}
      />
    </AuthMobileLayout>
  );
}
