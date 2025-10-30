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
  FormContainer,
  FormHeader,
  FormButton,
  ErrorMessage,
  LinkText,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TForgotPasswordResetFormProps } from "@/types/login/types";

export const ForgotPasswordResetForm = memo(
  (props: TForgotPasswordResetFormProps) => {
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

    return (
      <FormContainer>
        <FormHeader
          title="Reset Password"
          subtitle="Enter the code sent to your email and set a new password."
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

          <FormButton
            title="Reset Password"
            onPress={onSubmit}
            colors={colors}
          />
        </View>

        <LinkText
          text="All set?"
          linkText="Back to Login"
          colors={colors}
          onPress={onBackToLogin}
        />
      </FormContainer>
    );
  },
);
ForgotPasswordResetForm.displayName = "ForgotPasswordResetForm";
