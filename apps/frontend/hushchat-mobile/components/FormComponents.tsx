import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, StyleSheet } from "react-native";
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
  buttonTextEnabled: {
    color: "#fff",
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
});

export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle, colors }) => (
  <View style={styles.headerContainer}>
    <Text style={[styles.headerTitle, { color: colors.primary }]}>{title}</Text>
    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
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
        disabled ? { color: colors.textSecondary } : styles.buttonTextEnabled,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

export const LinkText: React.FC<LinkTextProps> = ({ text, linkText, onPress, colors }) => (
  <View style={styles.linkContainer}>
    <Text style={[styles.linkText, { color: colors.textSecondary }]}>{text}</Text>
    <TouchableOpacity onPress={onPress}>
      <Text style={[styles.linkButton, { color: colors.primary }]}>{linkText}</Text>
    </TouchableOpacity>
  </View>
);

export const FormContainer: React.FC<FormContainerProps> = ({ children, maxWidth = 450 }) => (
  <View style={[styles.formContainer, { maxWidth }]}>{children}</View>
);
