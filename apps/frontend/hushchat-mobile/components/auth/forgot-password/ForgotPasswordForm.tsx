import { memo } from "react";
import { View, useWindowDimensions } from "react-native";
import {
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
  FormContainer,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TForgotPasswordFormProps } from "@/types/login/types";
import { AppText } from "@/components/AppText";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";

export const ForgotPasswordForm = memo((props: TForgotPasswordFormProps) => {
  const {
    errorMessage,
    successMessage,
    onSubmit,
    onValueChange,
    formValues,
    formErrors,
    showErrors,
    onBackToLogin,
  } = props;

  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const { colors } = useAuthThemeColors();

  return (
    <FormContainer style={isMobile ? { flex: 1 } : undefined}>
      <View style={{ flex: 1 }}>
        <View>
          <FormHeader
            title="Forgot Password"
            subtitle="Enter your email - we'll send you a verification code."
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
          <FormButton title="Send Verification Code" onPress={onSubmit} colors={colors} />
          <LinkText
            text="Remember your password?"
            linkText="Login"
            colors={colors}
            onPress={onBackToLogin}
          />
        </View>
      </View>
    </FormContainer>
  );
});
ForgotPasswordForm.displayName = "ForgotPasswordForm";
