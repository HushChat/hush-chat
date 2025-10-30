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

import React from "react";
import { View, StyleSheet } from "react-native";
import {
  FormHeader,
  FormButton,
  ErrorMessage,
  FormContainer,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TRegisterFormProps } from "@/types/login/types";

export const RegisterForm = ({
  colors,
  errorMessage,
  formValues,
  formErrors,
  showErrors,
  onValueChange,
  onSubmit,
  isLoading,
}: TRegisterFormProps) => {
  const sharedProps = {
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  };

  return (
    <FormContainer>
      <FormHeader
        title="Register"
        subtitle="Create your account to get started."
        colors={colors}
      />

      {!!errorMessage && (
        <ErrorMessage message={errorMessage} colors={colors} />
      )}

      <View style={styles.fieldsContainer}>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <TextField
              name="firstName"
              placeholder="First Name"
              {...sharedProps}
            />
          </View>
          <View style={styles.halfWidth}>
            <TextField
              name="lastName"
              placeholder="Last Name"
              {...sharedProps}
            />
          </View>
        </View>

        <TextField
          name="username"
          placeholder="Username"
          autoCapitalize="none"
          {...sharedProps}
        />

        <TextField
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          {...sharedProps}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <TextField
              name="password"
              placeholder="Password"
              secureTextEntry
              {...sharedProps}
            />
          </View>
          <View style={styles.halfWidth}>
            <TextField
              name="confirmPassword"
              placeholder="Confirm Password"
              secureTextEntry
              {...sharedProps}
            />
          </View>
        </View>
      </View>

      <FormButton
        title={isLoading ? "Registering..." : "Register"}
        onPress={onSubmit}
        disabled={isLoading}
        colors={colors}
        style={{ marginTop: 24 }}
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
  row: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  halfWidth: {
    flex: 1,
  },
});
