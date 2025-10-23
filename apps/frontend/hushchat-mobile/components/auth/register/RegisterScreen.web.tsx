import React from 'react';
import { useAuthThemeColors } from '@/hooks/useAuthThemeColors';
import { Images } from '@/assets/images';
import { useRegisterForm } from '@/hooks/auth/useRegisterForm';
import { RegisterForm } from '@/components/auth/register/RegisterForm';
import AuthWebLayout from '@/components/auth/AuthWebLayout';

export default function RegisterScreen() {
  const { colors } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useRegisterForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Create your account"
      subtitle="Join your team workspace and start collaborating. It takes less than a minute."
      image={Images.Workspace}
    >
      <RegisterForm
        colors={colors}
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
      />
    </AuthWebLayout>
  );
}
