import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { Images } from "@/assets/images";
import { useVerifyOtpForm } from "@/hooks/auth/useVerifyOtpForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { VerifyOtpForm } from "@/components/auth/verify-otp/VerifyOtpForm";

export default function VerifyOtpScreen() {
  const { colors } = useAuthThemeColors();
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
    <AuthWebLayout
      colors={colors}
      title="Verify your account"
      subtitle="We've sent a verification code to your email. Please enter it below to complete your registration."
      image={Images.Workspace}
    >
      <VerifyOtpForm
        colors={colors}
        errorMessage={errorMessage}
        confirmationCode={confirmationCode}
        onCodeChange={onCodeChange}
        onSubmit={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        isLoading={isLoading}
      />
    </AuthWebLayout>
  );
}
