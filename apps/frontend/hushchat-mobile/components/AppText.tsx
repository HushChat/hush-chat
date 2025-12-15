import React, { forwardRef } from "react";
import {
  Text,
  StyleSheet,
  TextProps,
  TextInput,
  TextInputProps,
  useColorScheme,
} from "react-native";

const COLORS = {
  TEXT_LIGHT: "#333333",
  TEXT_DARK: "#FFFFFF",
  PLACEHOLDER_LIGHT: "#777777",
  PLACEHOLDER_DARK: "#AAAAAA",
};

/**
 * Custom themed text input for the app.
 *
 * This ensures consistent typography and color across the app
 * while adapting automatically to light/dark mode.
 */
export const AppTextInput = forwardRef<TextInput, TextInputProps>(
  ({ style, ...otherProps }, ref) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
      <TextInput
        ref={ref}
        style={[styles.defaultText, isDark ? styles.darkText : styles.lightText, style]}
        placeholderTextColor={isDark ? "#AAAAAA" : "#777777"}
        {...otherProps}
      />
    );
  }
);

/**
 * Custom themed text component for the app.
 *
 * Use this instead of React Native's default Text component
 * to maintain consistent typography and dark mode support.
 */
export const AppText = ({ children, style, ...otherProps }: TextProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Text
      style={[styles.defaultText, isDark ? styles.darkText : styles.lightText, style]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Poppins-Regular",
  },
  lightText: {
    color: COLORS.TEXT_LIGHT,
  },
  darkText: {
    color: COLORS.TEXT_DARK,
  },
});
