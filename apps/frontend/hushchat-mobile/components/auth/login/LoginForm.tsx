import {
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
  FormContainer,
} from "@/components/FormComponents";
import { memo } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import {
  AUTH_FORGOT_PASSWORD_PATH,
  AUTH_REGISTER_PATH,
} from "@/constants/routes";
import { TLoginFormProps } from "@/types/login/types";
import TextField from "@/components/forms/TextField";

export const LoginForm = memo(
  ({
    colors,
    errorMessage,
    onSubmit,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  }: TLoginFormProps) => (
    <FormContainer>
      <FormHeader
        title="Login"
        subtitle="Please login to your account to continue"
        colors={colors}
      />

      {!!errorMessage && (
        <ErrorMessage message={errorMessage} colors={colors} />
      )}

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
          <Text
            className="text-[15px] font-bold"
            style={{ color: colors.primary }}
          >
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <FormButton title="Log In" onPress={onSubmit} colors={colors} />

        <LinkText
          text="Don't have an account?"
          linkText="Register"
          colors={colors}
          onPress={() => router.push(AUTH_REGISTER_PATH)}
        />
      </View>
    </FormContainer>
  ),
);
LoginForm.displayName = "LoginForm";
