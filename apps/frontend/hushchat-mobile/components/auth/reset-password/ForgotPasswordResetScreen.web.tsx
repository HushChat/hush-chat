import React from 'react';
import { useAuthThemeColors } from '@/hooks/useAuthThemeColors';
import { Images } from '@/assets/images';
import { useForgotPasswordReset } from '@/hooks/auth/useForgotPasswordReset';
import { ForgotPasswordResetForm } from '@/components/auth/reset-password/ForgotPasswordResetForm';
import AuthWebLayout from '@/components/auth/AuthWebLayout';

export default function ForgotPasswordResetScreen() {
  const { colors } = useAuthThemeColors();
  const {
    errorMessage,
    successMessage,
    formValues,
    formErrors,
    showErrors,
    onValueChange,
    onSubmit,
    onBackToLogin,
  } = useForgotPasswordReset();

  return (
    <AuthWebLayout
      colors={colors}
      title="Check your inbox"
      subtitle="Enter the code we sent to your email and choose a new password."
      image={Images.Workspace}
    >
      <ForgotPasswordResetForm
        colors={colors}
        errorMessage={errorMessage}
        successMessage={successMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={onSubmit}
        onBackToLogin={onBackToLogin}
      />
    </AuthWebLayout>
  );
}
