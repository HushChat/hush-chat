/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
