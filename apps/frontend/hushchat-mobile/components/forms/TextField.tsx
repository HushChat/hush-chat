import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { TextInput, TextInputProps, View, Text, Pressable } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

interface FormTextInputProps extends TextInputProps {
  label?: string;
  name: string;
  showPasswordVisibilityToggle?: boolean;
  onValueChange?: (args: { name: string; value: string }) => void;
  formValues: Record<string, string | null>;
  formErrors: Record<string, string>;
  showErrors: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  platformAwareDefault?: boolean;
}

type SizeKey = NonNullable<FormTextInputProps["size"]>;

export const SIZE_PRESETS: Record<
  SizeKey,
  {
    inputHeight: string;
    px: string;
    py: string;
    font: string;
    label: string;
    error: string;
    radius: string;
    iconSize: number;
  }
> = {
  sm: {
    inputHeight: "h-10",
    px: "px-3",
    py: "py-2.5",
    font: "text-sm",
    label: "text-xs",
    error: "text-[10px]",
    radius: "rounded-md",
    iconSize: 20,
  },
  md: {
    inputHeight: "h-12",
    px: "px-3",
    py: "py-3",
    font: "text-base",
    label: "text-sm",
    error: "text-xs",
    radius: "rounded-lg",
    iconSize: 22,
  },
  lg: {
    inputHeight: "h-14",
    px: "px-4",
    py: "py-3.5",
    font: "text-base",
    label: "text-sm",
    error: "text-xs",
    radius: "rounded-lg",
    iconSize: 24,
  },
  xl: {
    inputHeight: "h-16",
    px: "px-4",
    py: "py-4",
    font: "text-lg",
    label: "text-base",
    error: "text-sm",
    radius: "rounded-xl",
    iconSize: 28,
  },
};

const PasswordVisibilityToggle = ({
  isPasswordVisible,
  onToggle,
  iconSize,
}: {
  isPasswordVisible: boolean;
  onToggle: () => void;
  iconSize: number;
}) => {
  return (
    <Pressable className="absolute top-1/2 -translate-y-1/2 right-4" onPress={onToggle}>
      <Ionicons name={isPasswordVisible ? "eye" : "eye-off"} color={"#9CA3AF"} size={iconSize} />
    </Pressable>
  );
};

const TextField = (props: FormTextInputProps) => {
  const {
    label,
    showPasswordVisibilityToggle = true,
    name,
    className,
    formValues,
    secureTextEntry,
    formErrors,
    showErrors,
    placeholderTextColor,
    size,
    platformAwareDefault = true,
    ...rest
  } = props;

  const [isPasswordField, setIsPasswordField] = useState<boolean>(secureTextEntry ?? false);

  // Decide effective size with platform-aware default
  const effectiveSize: SizeKey = useMemo(() => {
    if (size) return size;
    if (!platformAwareDefault) return "md";
    return PLATFORM.IS_WEB ? "lg" : "md";
  }, [size, platformAwareDefault]);

  const tokens = SIZE_PRESETS[effectiveSize];

  const inputBase =
    "border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
    "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 " +
    "bg-white dark:bg-gray-900";

  return (
    <View className="flex-col gap-y-1">
      {label && (
        <Text className={`text-gray-900 dark:text-gray-100 font-medium ${tokens.label}`}>
          {label}
        </Text>
      )}

      <View className="flex-col gap-y-1">
        <View className="relative">
          <TextInput
            value={(formValues?.[name] as string) ?? ""}
            className={`${inputBase} ${tokens.px} ${tokens.py} ${tokens.inputHeight} ${tokens.font} ${tokens.radius} ${className || ""}`}
            secureTextEntry={isPasswordField}
            placeholderTextColor={placeholderTextColor || "#9CA3AF"}
            onChangeText={(text) => props?.onValueChange?.({ name, value: text })}
            enablesReturnKeyAutomatically
            {...rest}
          />
          {showPasswordVisibilityToggle && secureTextEntry && (
            <PasswordVisibilityToggle
              isPasswordVisible={isPasswordField}
              onToggle={() => setIsPasswordField((prev) => !prev)}
              iconSize={tokens.iconSize}
            />
          )}
        </View>

        {formErrors?.[name] && showErrors && (
          <Text className={`text-red-600 ${tokens.error}`}>{formErrors?.[name]}</Text>
        )}
      </View>
    </View>
  );
};

export default TextField;
