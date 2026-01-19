import React from "react";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function LoginScreen() {
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit } =
    useLoginForm();

  return (
    <AuthWebLayout>
      <LoginForm
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
