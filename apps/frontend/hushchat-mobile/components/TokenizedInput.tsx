import { useState, useRef, ReactNode } from "react";
import { View, TextInput, KeyboardTypeOptions } from "react-native";
import { AppText, AppTextInput } from "@/components/AppText";
import { PLATFORM } from "@/constants/platformConstants";

interface TokenizedInputProps<T> {
  value: T[];
  onChange: (values: T[]) => void;
  renderToken: (item: T, remove: () => void) => ReactNode;
  parseInput: (text: string) => T[];
  isValid?: (item: T) => boolean;
  getKey: (item: T) => string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  max?: number;
  minWidthInput?: number;
  classNameContainer?: string;
  classNameInput?: string;
}

export default function TokenizedInputBase<T>({
  value = [],
  onChange,
  renderToken,
  parseInput,
  isValid = () => true,
  getKey,
  placeholder = "Type and press enter...",
  keyboardType = "default",
  error,
  max,
  minWidthInput = 120,
  classNameContainer = "",
  classNameInput = "",
}: TokenizedInputProps<T>) {
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const addItems = (text: string) => {
    if (!text.trim()) return;

    const candidates = parseInput(text);
    const validNew = candidates
      .filter(isValid)
      .filter((item) => !value.some((v) => getKey(v) === getKey(item)))
      .slice(0, max ? max - value.length : undefined);

    if (validNew.length > 0) {
      onChange([...value, ...validNew]);
    }

    setInputText("");
  };

  const removeItem = (item: T) => {
    onChange(value.filter((v) => getKey(v) !== getKey(item)));
    inputRef.current?.focus();
  };

  const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
    if (nativeEvent.key === "Backspace" && inputText === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    addItems(inputText);
    if (PLATFORM.IS_WEB) {
      inputRef.current?.blur();
    }
  };

  return (
    <View>
      <View
        className={`
          flex-row flex-wrap items-center
          bg-white dark:bg-gray-800
          border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}
          rounded-lg px-3 py-2 min-h-[48px]
          ${classNameContainer}
        `}
      >
        {value.map((item) => (
          <View key={getKey(item)}>{renderToken(item, () => removeItem(item))}</View>
        ))}

        <AppTextInput
          ref={inputRef}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSubmit}
          onKeyPress={handleKeyPress}
          onBlur={() => addItems(inputText)}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          keyboardType={keyboardType}
          returnKeyType="done"
          enablesReturnKeyAutomatically={true}
          className={`
            flex-1 text-gray-900 dark:text-white text-base py-2 outline-none
            min-w-[${minWidthInput}px]
            ${classNameInput}
          `}
          autoFocus
        />
      </View>

      {error && <AppText className="text-red-500 text-sm mt-1.5">{error}</AppText>}
    </View>
  );
}
