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

import { PLATFORM } from "@/constants/platformConstants";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, TextInput, View } from "react-native";

interface SearchBarProps {
  ref?: React.RefObject<TextInput>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchBar = ({
  ref,
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}: SearchBarProps) => {
  const { isDark } = useAppTheme();

  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 flex-1">
      <Ionicons
        name="search"
        size={20}
        className="!text-text-secondary-light dark:!text-text-secondary-dark"
      />
      <TextInput
        ref={ref || null}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
        className="py-2 flex-1 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full px-2"
        style={{
          borderWidth: 0,
          borderColor: "transparent",
          // Additional properties to ensure no focus styling
          ...(Platform.OS === "web" && {
            outline: "none",
            boxShadow: "none",
          }),
        }}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        // Additional iOS-specific props to remove focus styling
        {...(PLATFORM.IS_IOS && {
          clearButtonMode: "never",
        })}
      />
      {value && (
        <Pressable
          className="rounded-full bg-gray-300 dark:bg-gray-700 size-[17px] flex-row items-center justify-center"
          onPress={onClear}
        >
          <Ionicons
            name="close"
            size={13}
            className="!text-text-secondary-light dark:!text-text-secondary-dark"
          />
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;
