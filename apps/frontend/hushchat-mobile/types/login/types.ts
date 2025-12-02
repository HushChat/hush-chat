import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";
import { ICreateWorkspace, IRegisterUser, IWorkspaceRegister } from "@/types/user/types";

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

export interface Workspace {
  id: number;
  name: string;
  description: string;
  workspaceIdentifier: string;
  imageUrl: string | null;
  status: "PENDING" | "ACCEPTED";
}

export type TWorkspaceFormProps = {
  colors: AuthColors;
  isDark: boolean;
  showErrors: boolean;
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

export type TWorkspaceRegisterFormProps = {
  colors: AuthColors;
  errorMessage: string;
  formValues: IWorkspaceRegister;
  formErrors: Record<string, string>;
  showErrors: boolean;
  onValueChange: (args: { name: string; value: string }) => void;
  onSubmit: () => void;
  isLoading: boolean;
};

export type TCreateWorkspaceFormProps = {
  colors: AuthColors;
  errorMessage: string;
  formValues: ICreateWorkspace;
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

export interface WorkspaceDropdownProps {
  label?: string;
  placeholder?: string;
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  onSelectWorkspace: (workspace: Workspace) => void;
  formErrors?: Record<string, string>;
  showErrors?: boolean;
  errorKey?: string;
  size?: "sm" | "md" | "lg" | "xl";
  platformAwareDefault?: boolean;
  loading: boolean;
}
