import React from "react";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function LoginScreen() {
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit } =
    useLoginForm();

  return (
    <AuthMobileLayout>
      <LoginForm
        errorMessage={errorMessage}
        onSubmit={submit}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
      />
    </AuthMobileLayout>
  );
}
