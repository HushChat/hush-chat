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
