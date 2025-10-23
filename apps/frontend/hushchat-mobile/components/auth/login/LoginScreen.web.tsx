import React from 'react';
import { useAuthThemeColors } from '@/hooks/useAuthThemeColors';
import { Images } from '@/assets/images';
import { LoginForm } from '@/components/auth/login/LoginForm';
import { useLoginForm } from '@/hooks/auth/useLoginForm';
import AuthWebLayout from '@/components/auth/AuthWebLayout';

export default function LoginScreen() {
  const { colors } = useAuthThemeColors();
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit } =
    useLoginForm();

  return (
    <AuthWebLayout
      colors={colors}
      title="Welcome!"
      subtitle="Streamline conversations. Boost productivity."
      image={Images.LoginPeople}
    >
      <LoginForm
        colors={colors}
        errorMessage={errorMessage}
        onSubmit={submit}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
      />
    </AuthWebLayout>
  );
}
