import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { useRegisterForm } from "@/hooks/auth/useRegisterForm";
import { RegisterForm } from "@/components/auth/register/RegisterForm";
import AuthWebLayout from "@/components/auth/AuthWebLayout";

export default function RegisterScreen() {
  const { colors } = useAuthThemeColors();

  const { formValues, formErrors, showErrors, errorMessage, onValueChange, submit, isLoading } =
    useRegisterForm();

  return (
    <AuthWebLayout
      colors={colors}
      heroTitle="Start communicating, securely today."
      heroSubtitle="Join thousands of teams who trust HushChat for their most important  conversations. Setup takes less than 2 minutes."
      features={[
        { icon: "shield-checkmark-outline", text: "Free to get started" },
        { icon: "phone-portrait-outline", text: "Sync across all your devices" },
        { icon: "laptop-outline", text: "Join unlimited workspaces" },
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
      />
    </AuthWebLayout>
  );
}
