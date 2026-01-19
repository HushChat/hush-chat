import {
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
  FormContainer,
} from "@/components/FormComponents";
import { memo } from "react";
import { TouchableOpacity, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { AUTH_FORGOT_PASSWORD_PATH, AUTH_REGISTER_PATH } from "@/constants/routes";
import { TLoginFormProps } from "@/types/login/types";
import TextField from "@/components/forms/TextField";
import { AppText } from "@/components/AppText";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";

export const LoginForm = memo(
  ({
    errorMessage,
    onSubmit,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  }: TLoginFormProps) => {
    const { width } = useWindowDimensions();
    const isMobile = width < 1024;

    const { colors } = useAuthThemeColors();

    return (
      <FormContainer style={isMobile ? { flex: 1 } : undefined}>
        <View style={{ flex: 1 }}>
          <View>
            <FormHeader
              title="Welcome back"
              subtitle="Sign in to continue to your conversations"
              colors={colors}
            />

            {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

            <View className="mb-2">
              <View className="flex-col gap-3">
                <TextField
                  name="email"
                  label="Email address"
                  placeholder="Email Adress"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  formValues={formValues}
                  formErrors={formErrors}
                  showErrors={showErrors}
                  onValueChange={onValueChange}
                  size="md"
                />

                <TextField
                  name="password"
                  label="Password"
                  placeholder="Password"
                  secureTextEntry
                  formValues={formValues}
                  formErrors={formErrors}
                  showErrors={showErrors}
                  onValueChange={onValueChange}
                  size="md"
                />
              </View>
              <TouchableOpacity
                className="self-end pt-2 mb-5"
                onPress={() => router.push(AUTH_FORGOT_PASSWORD_PATH)}
              >
                <AppText className="text-base font-medium!" style={{ color: colors.primary }}>
                  Forgot password?
                </AppText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flex: isMobile ? 1 : 0, minHeight: 20 }} />

          <View>
            <FormButton title="Login" onPress={onSubmit} colors={colors} />

            <LinkText
              text="Don't have an account?"
              linkText="Create one"
              colors={colors}
              onPress={() => router.push(AUTH_REGISTER_PATH)}
            />
          </View>
        </View>
      </FormContainer>
    );
  }
);
LoginForm.displayName = "LoginForm";
