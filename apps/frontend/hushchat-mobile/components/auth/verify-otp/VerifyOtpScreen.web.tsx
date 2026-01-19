import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useVerifyOtpForm } from "@/hooks/auth/useVerifyOtpForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
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
    <AuthWebLayout
      heroTitle="Almost there! Let's verify it's you."
      heroSubtitle="Security is our top priority. This quick verification step helps keep your account safe from unauthorized access."
      features={[]}
    >
      <VerifyOtpForm
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
