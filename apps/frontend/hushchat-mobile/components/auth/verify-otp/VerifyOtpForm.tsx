import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { FormHeader, FormButton, ErrorMessage, FormContainer } from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";

type TVerifyOtpFormProps = {
  colors: any;
  errorMessage: string;
  confirmationCode: string;
  onCodeChange: (code: string) => void;
  onSubmit: () => void;
  onResendOtp: () => void;
  isLoading: boolean;
};

export const VerifyOtpForm = ({
  colors,
  errorMessage,
  confirmationCode,
  onCodeChange,
  onSubmit,
  onResendOtp,
  isLoading,
}: TVerifyOtpFormProps) => {
  return (
    <FormContainer>
      <FormHeader
        title="Verify OTP"
        subtitle="Enter the verification code sent to your email."
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
          onValueChange={({ value }) => onCodeChange(value)}
        />
      </View>

      <View style={styles.resendContainer}>
        <AppText style={[styles.resendText, { color: colors.textSecondary }]}>
          Didn&apos;t receive the verification code?{" "}
        </AppText>

        <TouchableOpacity onPress={onResendOtp} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
          <AppText style={[styles.resendLink, { color: colors.primary }]}>Resend</AppText>
        </TouchableOpacity>
      </View>

      <FormButton
        title={isLoading ? "Verifying..." : "Verify & Proceed"}
        onPress={onSubmit}
        disabled={isLoading}
        colors={colors}
        style={styles.submitButton}
      />
    </FormContainer>
  );
};

const styles = StyleSheet.create({
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
    textDecorationLine: "underline",
  },
  submitButton: {
    marginTop: 24,
  },
});
