import React from 'react';
import { useRouter } from 'expo-router';
import { useAuthThemeColors } from '@/hooks/useAuthThemeColors';
import { Images } from '@/assets/images';
import { useForgotPassword } from '@/hooks/auth/useForgotPassword';
import { ForgotPasswordForm } from '@/components/auth/forgot-password/ForgotPasswordForm';
import AuthMobileLayout from '@/components/auth/AuthMobileLayout';

export default function ForgotPasswordScreen() {
  const { colors } = useAuthThemeColors();
  const router = useRouter();
  const { email, setEmail, errorMessage, successMessage, handleSendCode, goBackToLogin } =
    useForgotPassword();

  return (
    <AuthMobileLayout colors={colors} image={Images.LoginPeople} onBack={() => router.back()}>
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
    </AuthMobileLayout>
  );
}
