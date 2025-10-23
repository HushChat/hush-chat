import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FormHeader, FormButton, ErrorMessage, FormContainer } from '@/components/FormComponents';
import TextField from '@/components/forms/TextField';
import { TRegisterFormProps } from '@/types/login/types';

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
      <FormHeader title="Register" subtitle="Create your account to get started." colors={colors} />

      {!!errorMessage && <ErrorMessage message={errorMessage} colors={colors} />}

      <View style={styles.fieldsContainer}>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <TextField name="firstName" placeholder="First Name" {...sharedProps} />
          </View>
          <View style={styles.halfWidth}>
            <TextField name="lastName" placeholder="Last Name" {...sharedProps} />
          </View>
        </View>

        <TextField name="username" placeholder="Username" autoCapitalize="none" {...sharedProps} />

        <TextField
          name="email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          {...sharedProps}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <TextField name="password" placeholder="Password" secureTextEntry {...sharedProps} />
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
        title={isLoading ? 'Registering...' : 'Register'}
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
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
});
