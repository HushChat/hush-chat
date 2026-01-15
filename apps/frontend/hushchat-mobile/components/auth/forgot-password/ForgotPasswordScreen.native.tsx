import React from "react";
import { useRouter } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useAuthThemeColors();
  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthMobileLayout colors={colors} isDark={isDark} onBack={() => router.back()}>
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
    </AuthMobileLayout>
  );
}
