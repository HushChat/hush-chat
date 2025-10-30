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

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from "react-native";
import { AuthColors } from "@/types/login/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface FormHeaderProps {
  title: string;
  subtitle: string;
  colors: AuthColors;
}

interface FormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  colors: AuthColors;
  style?: ViewStyle;
}

interface ErrorMessageProps {
  message: string;
  colors: AuthColors;
}

interface LinkTextProps {
  text: string;
  linkText: string;
  onPress?: () => void;
  colors: AuthColors;
}

interface FormContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 12,
    borderWidth: 2,
  },
  textInput: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderColor: "#f87171",
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    fontSize: 15,
    marginRight: 4,
  },
  linkButton: {
    fontSize: 15,
    fontWeight: "700",
  },
  formContainer: {
    width: "100%",
    alignSelf: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  subtitle,
  colors,
}) => (
  <View style={styles.headerContainer}>
    <Text style={[styles.headerTitle, { color: colors.primary }]}>{title}</Text>
    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
      {subtitle}
    </Text>
  </View>
);

export const FormButton: React.FC<FormButtonProps> = ({
  title,
  onPress,
  disabled = false,
  colors,
  style,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={DEFAULT_ACTIVE_OPACITY}
    style={[
      styles.button,
      disabled && styles.buttonDisabled,
      {
        backgroundColor: disabled ? colors.buttonDisabled : colors.primary,
        boxShadow: colors.primary,
      },
      style,
    ]}
  >
    <Text
      style={[
        styles.buttonText,
        { color: disabled ? colors.textSecondary : "#fff" },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  colors,
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

export const LinkText: React.FC<LinkTextProps> = ({
  text,
  linkText,
  onPress,
  colors,
}) => (
  <View style={styles.linkContainer}>
    <Text style={[styles.linkText, { color: colors.textSecondary }]}>
      {text}
    </Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.linkButton, { color: colors.primary }]}>
        {linkText}
      </Text>
    </TouchableOpacity>
  </View>
);

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  maxWidth = 450,
}) => <View style={[styles.formContainer, { maxWidth }]}>{children}</View>;
