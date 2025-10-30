/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

      {!!errorMessage && (
        <ErrorMessage message={errorMessage} colors={colors} />
      )}

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

        <FormButton
          title="Send Verification Code"
          onPress={onSubmit}
          colors={colors}
        />
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
