import React from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import {
  FormHeader,
  FormButton,
  ErrorMessage,
  FormContainer,
  LinkText,
} from "@/components/FormComponents";
import TextField from "@/components/forms/TextField";
import { TRegisterFormProps } from "@/types/login/types";
import { router } from "expo-router";
import { AUTH_LOGIN_PATH } from "@/constants/routes";

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
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const sharedProps = {
    formValues,
    formErrors,
    showErrors,
    onValueChange,
  };

  return (
    <FormContainer style={isMobile ? { flex: 1 } : undefined}>
      <View style={{ flex: 1 }}>
        <View>
          <FormHeader
            title="Create your account"
            subtitle="Start your journey with secure team messaging"
            colors={colors}
          />

          {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

          <View style={styles.fieldsContainer}>
            <TextField
              name="email"
              label="Email address"
              placeholder="Email Adress"
              keyboardType="email-address"
              autoCapitalize="none"
              size="md"
              {...sharedProps}
            />

            <TextField
              name="password"
              label="Create password"
              placeholder="Password"
              secureTextEntry
              size="md"
              {...sharedProps}
            />

            <TextField
              name="confirmPassword"
              label="Confirm password"
              placeholder="Confirm password"
              secureTextEntry
              size="md"
              {...sharedProps}
            />
          </View>
        </View>

        <View style={{ flex: isMobile ? 1 : 0, minHeight: 20 }} />

        <View>
          <FormButton
            title={isLoading ? "Creating account..." : "Create account"}
            onPress={onSubmit}
            disabled={isLoading}
            colors={colors}
            style={styles.submitButton}
          />

          <LinkText
            text="Already have an account?"
            linkText="Sign in"
            colors={colors}
            onPress={() => router.push(AUTH_LOGIN_PATH)}
          />
        </View>
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
  fieldsContainer: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  submitButton: {
    marginTop: 24,
  },
});
