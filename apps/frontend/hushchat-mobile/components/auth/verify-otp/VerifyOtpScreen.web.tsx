import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useVerifyOtpForm } from "@/hooks/auth/useVerifyOtpForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";
import { VerifyOtpForm } from "@/components/auth/verify-otp/VerifyOtpForm";

import { useWindowDimensions } from "react-native";

export default function VerifyOtpScreen() {
  const { colors } = useAuthThemeColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

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
      heroTitle="Almost there! Let's verify it's you."
      heroSubtitle="Security is our top priority. This quick verification step helps keep your account safe from unauthorized access."
      features={[]}
    >
      <VerifyOtpForm
        colors={colors}
        errorMessage={errorMessage}
        confirmationCode={confirmationCode}
        onCodeChange={onCodeChange}
        onSubmit={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        isLoading={isLoading}
        stretch={isMobile}
      />
    </AuthWebLayout>
  );
}
