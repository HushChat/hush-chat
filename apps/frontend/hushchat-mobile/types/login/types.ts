import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { IRegisterUser } from "@/types/user/types";

export interface AuthColors {
  background: string;
  primary: string;
  secondary: string;
  textPrimary: string;
  textSecondary: string;
  inputBackground: string;
  inputBorder: string;
  inputFocusBorder: string;
  buttonDisabled: string;
  textDisabled: string;
}

export type TLoginFormProps = {
  colors: ReturnType<typeof useAuthThemeColors>["colors"];
  errorMessage: string;
  onSubmit: () => void;
  formValues: { email: string; password: string };
  formErrors: Record<string, string>;
  showErrors: boolean;
  onValueChange: (arg: { name: string; value: string }) => void;
};

export type TWorkspaceFormProps = {
  colors: AuthColors;
  isDark: boolean;
  formValues: { workspaceName: string };
  formErrors: Record<string, string>;
  showErrors: boolean;
  onValueChange: (args: { name: string; value: string }) => void;
  handleNext: () => void;
};

export type TRegisterFormProps = {
  colors: AuthColors;
  errorMessage: string;
  formValues: IRegisterUser;
  formErrors: Record<string, string>;
  showErrors: boolean;
  onValueChange: (args: { name: string; value: string }) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

export type TForgotPasswordFormProps = {
  colors: ReturnType<typeof useAuthThemeColors>["colors"];
  errorMessage?: string | null;
  successMessage?: string | null;
  onSubmit: () => void;
  onValueChange: (args: { name: string; value: string }) => void;
  formValues: Record<string, string | null>;
  formErrors: Record<string, string>;
  showErrors: boolean;
  onBackToLogin: () => void;
};

export type TForgotPasswordResetFormProps = {
  colors: ReturnType<typeof useAuthThemeColors>["colors"];
  errorMessage?: string | null;
  successMessage?: string | null;
  formValues: Record<string, string | null>;
  formErrors: Record<string, string>;
  showErrors: boolean;
  onValueChange: (args: { name: string; value: string }) => void;
  onSubmit: () => void;
  onBackToLogin: () => void;
};

export type TProfileFormProps = {
  firstName: string;
  lastName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};
