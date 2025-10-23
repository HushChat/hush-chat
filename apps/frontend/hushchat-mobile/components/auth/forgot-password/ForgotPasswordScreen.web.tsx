import React from 'react';
import { useAuthThemeColors } from '@/hooks/useAuthThemeColors';
import { Images } from '@/assets/images';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { ForgotPasswordForm } from '@/components/auth/forgot-password/ForgotPasswordForm';
import AuthWebLayout from '@/components/auth/AuthWebLayout';

export default function ForgotPasswordScreen() {
  const { colors } = useAuthThemeColors();
  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthWebLayout
      colors={colors}
      title="Forgot your password?"
      subtitle="No stress. Enter your email and we’ll send a one-time code to help you get back in."
      image={Images.LoginPeople}
    >
      <ForgotPasswordForm
        colors={colors}
        errorMessage={errorMessage}
        successMessage={successMessage}
        onSubmit={handleSendCode}
        onBackToLogin={goBackToLogin}
        formValues={{ email }}
        formErrors={{}}
        showErrors={false}
        onValueChange={({ name, value }) => {
          if (name === 'email') setEmail(value);
        }}
      />
    </AuthWebLayout>
  );
}
