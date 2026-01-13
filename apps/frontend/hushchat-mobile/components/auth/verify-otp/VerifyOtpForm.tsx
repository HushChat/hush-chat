import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FormHeader, FormButton, ErrorMessage, FormContainer } from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";
import { router } from "expo-router";
import { AUTH_REGISTER_PATH } from "@/constants/routes";

type TVerifyOtpFormProps = {
  colors: any;
  errorMessage: string;
  confirmationCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResendOtp: () => void;
  isLoading: boolean;
  stretch?: boolean;
};

export const VerifyOtpForm = ({
  colors,
  errorMessage,
  confirmationCode,
  onCodeChange,
  onSubmit,
  onResendOtp,
  isLoading,
  stretch,
}: TVerifyOtpFormProps) => {
  const handleBack = () => {
    router.replace(AUTH_REGISTER_PATH);
  };

  return (
    <FormContainer style={stretch ? { flex: 1 } : undefined}>
      <View style={{ flex: 1 }}>
        <View>
          <TouchableOpacity
            style={styles.backButtonTop}
            onPress={handleBack}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <AppText style={[styles.backButtonText, { color: colors.textSecondary }]}>
              {"< Back"}
            </AppText>
          </TouchableOpacity>

          <FormHeader
            title="Check your email"
            subtitle="We've sent a 6-digit verification code to your email"
            colors={colors}
          />

          {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

          <View style={styles.fieldsContainer}>
            <TextField
              name="otp"
              placeholder="OTP"
              keyboardType="numeric"
              autoCapitalize="none"
              formValues={{ otp: confirmationCode }}
              formErrors={{ otp: "" }}
              showErrors={false}
              size="md"
              onValueChange={({ value }) => onCodeChange(value)}
            />
          </View>

          <View style={styles.resendContainer}>
            <AppText style={[styles.resendText, { color: colors.textSecondary }]}>
              Didn&apos;t receive the code?{" "}
            </AppText>

            <TouchableOpacity onPress={onResendOtp} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
              <AppText style={[styles.resendLink, { color: colors.primary }]}>Resend</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ flex: stretch ? 1 : 0, minHeight: 20 }} />

        <View>
          <FormButton
            title={isLoading ? "Verifying..." : "Verify and Continue"}
            onPress={onSubmit}
            disabled={isLoading}
            colors={colors}
            style={styles.submitButton}
          />

          <View style={styles.bottomLinkContainer}>
            <AppText style={[styles.resendText, { color: colors.textSecondary }]}>
              Wrong email?{" "}
            </AppText>
            <TouchableOpacity onPress={handleBack} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
              <AppText style={[styles.resendLink, { color: colors.primary }]}>Go back</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  backButtonTop: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  fieldsContainer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: 24,
  },
  bottomLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
