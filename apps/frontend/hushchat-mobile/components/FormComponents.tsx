import React from "react";
import { View, TouchableOpacity, ViewStyle, StyleSheet, StyleProp } from "react-native";
import { AuthColors } from "@/types/login/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";

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
  style?: StyleProp<ViewStyle>;
}

const COLORS = {
  WHITE: "#ffffff",
  ERROR_BG: "#fef2f2",
  ERROR_BORDER: "#f87171",
  ERROR_TEXT: "#dc2626",
};

export const FormHeader: React.FC<FormHeaderProps> = ({ title, subtitle, colors }) => (
  <View style={styles.headerContainer}>
    <AppText style={[styles.headerTitle, { color: colors.textPrimary }]}>{title}</AppText>
    <AppText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{subtitle}</AppText>
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
    <AppText
      style={[
        styles.buttonText,
        disabled ? { color: colors.textSecondary } : styles.buttonTextEnabled,
      ]}
    >
      {title}
    </AppText>
  </TouchableOpacity>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <View style={styles.errorContainer}>
    <AppText style={styles.errorText}>{message}</AppText>
  </View>
);

export const LinkText: React.FC<LinkTextProps> = ({ text, linkText, onPress, colors }) => (
  <View style={styles.linkContainer}>
    <AppText style={[styles.linkText, { color: colors.textSecondary }]}>{text}</AppText>
    <TouchableOpacity onPress={onPress}>
      <AppText style={[styles.linkButton, { color: colors.primary }]}>{linkText}</AppText>
    </TouchableOpacity>
  </View>
);

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  maxWidth = 400,
  style,
}) => <View style={[styles.formContainer, { maxWidth }, style]}>{children}</View>;

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
    fontFamily: "Poppins-SemiBold",
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 20,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  buttonTextEnabled: {
    color: COLORS.WHITE,
  },
  errorContainer: {
    backgroundColor: COLORS.ERROR_BG,
    borderColor: COLORS.ERROR_BORDER,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.ERROR_TEXT,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  linkText: {
    fontSize: 16,
    marginRight: 4,
  },
  linkButton: {
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
  formContainer: {
    width: "100%",
    alignSelf: "center",
  },
});
