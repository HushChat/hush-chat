import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useVerifyOtpForm } from "@/hooks/auth/useVerifyOtpForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";
import { VerifyOtpForm } from "@/components/auth/verify-otp/VerifyOtpForm";

export default function VerifyOtpScreen() {
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
    <AuthMobileLayout>
      <VerifyOtpForm
        errorMessage={errorMessage}
        confirmationCode={confirmationCode}
        onCodeChange={onCodeChange}
        onSubmit={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        isLoading={isLoading}
      />
    </AuthMobileLayout>
  );
}
