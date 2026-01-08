import { useEffect, useRef } from "react";
import { PLATFORM } from "@/constants/platformConstants";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View, StyleSheet } from "react-native";
import { AppTextInput } from "./AppText";
// import { useSearchFocus } from "@/contexts/SearchFocusContext";
import { useRegisterSearch } from "@/hooks/hotkeys";

const COLORS = {
  BORDER_TRANSPARENT: "transparent",
};

const webInputStyle = PLATFORM.IS_WEB ? { outline: "none", boxShadow: "none" } : {};

interface SearchBarProps {
  inputRef?: React.RefObject<TextInput>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

const SearchBar = ({
  inputRef: externalRef,
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  autoFocus = false,
}: SearchBarProps) => {
  const { isDark } = useAppTheme();
  // const internalRef = useRef<TextInput>(null);
  // const { registerSearchInput } = useSearchFocus();

  const inputRef = useRef<TextInput>(null);
  useRegisterSearch(inputRef);

  // useEffect(() => {
  //   registerSearchInput(inputRef);
  // }, [inputRef, registerSearchInput]);

  return (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 flex-1">
      <Ionicons
        name="search"
        size={20}
        className="!text-text-secondary-light dark:!text-text-secondary-dark"
      />
      <AppTextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
        className="py-2 flex-1 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-full px-2"
        style={[styles.inputBase, webInputStyle]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
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

const styles = StyleSheet.create({
  inputBase: {
    borderWidth: 0,
    borderColor: COLORS.BORDER_TRANSPARENT,
  },
});
