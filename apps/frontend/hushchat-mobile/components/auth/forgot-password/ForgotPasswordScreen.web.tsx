import React from "react";
import { useWindowDimensions } from "react-native";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { ForgotPasswordForm } from "@/components/auth/forgot-password/ForgotPasswordForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function ForgotPasswordScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthWebLayout
      colors={colors}
      isDark={isDark}
      heroTitle="Forgot your password? No problem."
      heroSubtitle="It happens to the best of us. Enter your email and we'll send you a one-time code to help you get back in."
      features={[]}
    >
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
        stretch={isMobile}
      />
    </AuthWebLayout>
  );
}
