import React from "react";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthMobileLayout from "@/components/auth/AuthMobileLayout";

export default function RegisterScreen() {
  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useRegisterForm();

  return (
    <AuthMobileLayout>
      <RegisterForm
        errorMessage={errorMessage}
        formValues={formValues}
        formErrors={formErrors}
        showErrors={showErrors}
        onValueChange={onValueChange}
        onSubmit={submit}
        isLoading={isLoading}
      />
    </AuthMobileLayout>
  );
}
