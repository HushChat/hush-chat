import { memo } from "react";
import { View, useWindowDimensions } from "react-native";
import {
  FormContainer,
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TForgotPasswordResetFormProps } from "@/types/login/types";
import { AppText } from "@/components/AppText";

export const ForgotPasswordResetForm = memo((props: TForgotPasswordResetFormProps) => {
  const {
    colors,
    errorMessage,
    successMessage,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
    onSubmit,
    onBackToLogin,
  } = props;

  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  return (
    <FormContainer style={isMobile ? { flex: 1 } : undefined}>
      <View style={{ flex: 1 }}>
        <View>
          <FormHeader
            title="Reset Password"
            subtitle="Enter the code sent to your email and set a new password."
            colors={colors}
          />

          {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

          {!!successMessage && (
            <View className="mb-4 rounded-xl px-3 py-2 bg-green-100 dark:bg-emerald-950">
              <AppText className="text-sm font-semibold text-green-700 dark:text-emerald-300 text-center">
                {successMessage}
              </AppText>
            </View>
          )}

          <View className="flex-col gap-3">
            <TextField
              name="email"
              placeholder="Email Address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              formValues={formValues}
              formErrors={formErrors}
              showErrors={showErrors}
              onValueChange={onValueChange}
              platformAwareDefault
            />

            <TextField
              name="code"
              placeholder="Verification Code"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              formValues={formValues}
              formErrors={formErrors}
              showErrors={showErrors}
              onValueChange={onValueChange}
              platformAwareDefault
            />

            <TextField
              name="password"
              placeholder="New Password"
              secureTextEntry
              autoComplete="new-password"
              formValues={formValues}
              formErrors={formErrors}
              showErrors={showErrors}
              onValueChange={onValueChange}
              platformAwareDefault
            />

            <TextField
              name="confirmPassword"
              placeholder="Confirm New Password"
              secureTextEntry
              autoComplete="new-password"
              formValues={formValues}
              formErrors={formErrors}
              showErrors={showErrors}
              onValueChange={onValueChange}
              platformAwareDefault
            />
          </View>
        </View>

        <View style={{ flex: isMobile ? 1 : 0, minHeight: 20 }} />

        <View>
          <FormButton title="Reset Password" onPress={onSubmit} colors={colors} />
          <LinkText
            text="All set?"
            linkText="Back to Login"
            colors={colors}
            onPress={onBackToLogin}
          />
        </View>
      </View>
    </FormContainer>
  );
});
ForgotPasswordResetForm.displayName = "ForgotPasswordResetForm";
