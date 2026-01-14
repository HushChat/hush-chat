import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useVerifyOtpForm } from "@/hooks/auth/useVerifyOtpForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { VerifyOtpForm } from "@/components/auth/verify-otp/VerifyOtpForm";

export default function VerifyOtpScreen() {
  const { colors, isDark } = useAuthThemeColors();
  const { email } = useLocalSearchParams<{ email: string }>();
  const {
    confirmationCode,
    errorMessage,
    onCodeChange,
    handleVerifyOtp,
    handleResendOtp,
    isLoading,
  } = useVerifyOtpForm(email);

  return (
    <AuthMobileLayout colors={colors} isDark={isDark}>
      <VerifyOtpForm
        colors={colors}
        errorMessage={errorMessage}
        confirmationCode={confirmationCode}
        onCodeChange={onCodeChange}
        onSubmit={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        isLoading={isLoading}
        stretch={true}
      />
    </AuthMobileLayout>
  );
}
