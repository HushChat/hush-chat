import { memo } from "react";
import { View, Text } from "react-native";
import {
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
  FormContainer,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TForgotPasswordFormProps } from "@/types/login/types";

export const ForgotPasswordForm = memo((props: TForgotPasswordFormProps) => {
  const {
    colors,
    errorMessage,
    successMessage,
    onSubmit,
    onValueChange,
    formValues,
    formErrors,
    showErrors,
    onBackToLogin,
  } = props;

  return (
    <FormContainer>
      <FormHeader
        title="Forgot Password"
        subtitle="Enter your email — we'll send you a verification code."
        colors={colors}
      />

      {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

      {!!successMessage && (
        <View className="mb-4 rounded-xl px-3 py-2 bg-green-100 dark:bg-emerald-950">
          <Text className="text-sm font-semibold text-green-700 dark:text-emerald-300 text-center">
            {successMessage}
          </Text>
        </View>
      )}

      <View className="flex-col gap-3">
        <TextField
          name="email"
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          formValues={formValues}
          formErrors={formErrors}
          showErrors={showErrors}
          onValueChange={onValueChange}
          platformAwareDefault
        />

        <FormButton title="Send Verification Code" onPress={onSubmit} colors={colors} />
      </View>
      <LinkText
        text="Remember your password?"
        linkText="Login"
        colors={colors}
        onPress={onBackToLogin}
      />
    </FormContainer>
  );
});
ForgotPasswordForm.displayName = "ForgotPasswordForm";
