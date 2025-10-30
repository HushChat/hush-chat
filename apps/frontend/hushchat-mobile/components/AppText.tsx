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
  Text,
  StyleSheet,
  TextProps,
  TextInput,
  TextInputProps,
  useColorScheme,
} from "react-native";

/**
 * Custom themed text input for the app.
 *
 * This ensures consistent typography and color across the app
 * while adapting automatically to light/dark mode.
 */
export const AppTextInput = ({ style, ...otherProps }: TextInputProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <TextInput
      style={[
        styles.defaultText,
        { color: isDark ? "#FFFFFF" : "#333333" },
        style,
      ]}
      placeholderTextColor={isDark ? "#AAAAAA" : "#777777"}
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
  const isDark = colorScheme === "dark";

  return (
    <Text
      style={[
        styles.defaultText,
        { color: isDark ? "#FFFFFF" : "#333333" },
        style,
      ]}
      {...otherProps}
    >
      {children}
    </Text>
  );
};
const styles = StyleSheet.create({
  defaultText: {
    // TODO: Replace 'YourFont-Regular' with the actual font name loaded via useFonts.
    fontFamily: "Poppins-Regular",
  },
});
