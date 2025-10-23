import React from 'react';
import {
  Text,
  StyleSheet,
  TextProps,
  TextInput,
  TextInputProps,
  useColorScheme,
} from 'react-native';

/**
 * Custom themed text input for the app.
 *
 * This ensures consistent typography and color across the app
 * while adapting automatically to light/dark mode.
 */
export const AppTextInput = ({ style, ...otherProps }: TextInputProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <TextInput
      style={[styles.defaultText, { color: isDark ? '#FFFFFF' : '#333333' }, style]}
      placeholderTextColor={isDark ? '#AAAAAA' : '#777777'}
      {...otherProps}
    />
  );
};

/**
 * Custom themed text component for the app.
 *
 * Use this instead of React Native's default Text component
 * to maintain consistent typography and dark mode support.
 */
export const AppText = ({ children, style, ...otherProps }: TextProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Text
      style={[styles.defaultText, { color: isDark ? '#FFFFFF' : '#333333' }, style]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};
const styles = StyleSheet.create({
  defaultText: {
    // TODO: Replace 'YourFont-Regular' with the actual font name loaded via useFonts.
    fontFamily: 'Poppins-Regular',
  },
});
