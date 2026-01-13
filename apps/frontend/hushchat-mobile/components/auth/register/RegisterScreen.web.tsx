import React from "react";
import { useWindowDimensions } from "react-native";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function RegisterScreen() {
  const { colors } = useAuthThemeColors();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;

  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useRegisterForm();

  return (
    <AuthWebLayout
      colors={colors}
      heroTitle="Start communicating, securely today."
      heroSubtitle="Join thousands of teams who trust HushChat for their most important  conversations. Setup takes less than 2 minutes."
      features={[
        { icon: "shield-checkmark-outline", text: "Free to get started" },
        { icon: "person-outline", text: "No credit card required" },
        { icon: "person-outline", text: "Invite unlimited team members" },
      ]}
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
        stretch={isMobile}
      />
    </AuthWebLayout>
  );
}
