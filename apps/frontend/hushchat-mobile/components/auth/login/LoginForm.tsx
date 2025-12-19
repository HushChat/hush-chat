import {
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
  FormContainer,
} from "@/components/FormComponents";
import { memo } from "react";
import { TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { AUTH_FORGOT_PASSWORD_PATH, AUTH_REGISTER_PATH } from "@/constants/routes";
import { TLoginFormProps } from "@/types/login/types";
import TextField from "@/components/forms/TextField";
import { AppText } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

export const LoginForm = memo(
  ({
    colors,
    errorMessage,
    onSubmit,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
    // 🔽 BIOMETRIC PROPS
    biometricInfo,
    isBiometricEnabled,
    isAuthenticating,
    handleBiometricLogin,
  }: TLoginFormProps) => (
    <FormContainer>
      <FormHeader
        title="Login"
        subtitle="Please login to your account to continue"
        colors={colors}
      />

      {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

      <View className="mb-7">
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
          />

          <TextField
            name="password"
            placeholder="Password"
            secureTextEntry
            formValues={formValues}
            formErrors={formErrors}
            showErrors={showErrors}
            onValueChange={onValueChange}
          />
        </View>

        <TouchableOpacity
          className="self-end pt-2 mb-5"
          onPress={() => router.push(AUTH_FORGOT_PASSWORD_PATH)}
        >
          <AppText className="text-[15px] font-bold" style={{ color: colors.primary }}>
            Forgot Password?
          </AppText>
        </TouchableOpacity>

        {/* 🔐 NORMAL LOGIN */}
        <FormButton title="Log In" onPress={onSubmit} colors={colors} />

        {/* 🔐 BIOMETRIC LOGIN */}
        {/* 🛡️ Added optional chaining (?) just in case, though hook fixes it */}
        {biometricInfo?.isAvailable && isBiometricEnabled && (
          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center gap-2"
            onPress={handleBiometricLogin}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons name="scan-outline" size={22} color={colors.primary} />
            )}
            <AppText className="text-[16px] font-semibold" style={{ color: colors.primary }}>
              Login with {biometricInfo?.label || "Biometrics"}
            </AppText>
          </TouchableOpacity>
        )}

        <LinkText
          text="Don't have an account?"
          linkText="Register"
          colors={colors}
          onPress={() => router.push(AUTH_REGISTER_PATH)}
        />
      </View>
    </FormContainer>
  )
);

LoginForm.displayName = "LoginForm";
