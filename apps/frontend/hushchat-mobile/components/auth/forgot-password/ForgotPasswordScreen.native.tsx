import React from "react";
import { useRouter } from "expo-router";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthMobileLayout onBack={() => router.back()}>
      <ForgotPasswordForm
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
