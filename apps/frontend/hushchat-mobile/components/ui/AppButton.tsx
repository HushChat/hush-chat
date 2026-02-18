import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  className?: string;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary-light dark:bg-primary-dark",
    text: "text-white",
  },
  secondary: {
    container: "bg-secondary-light dark:bg-secondary-dark",
    text: "text-primary-light dark:text-primary-dark",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-text-primary-light dark:text-text-primary-dark",
  },
  destructive: {
    container: "bg-error",
    text: "text-white",
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string; icon: number }> = {
  sm: { container: "px-3 py-1.5 rounded-lg", text: "text-sm", icon: 16 },
  md: { container: "px-4 py-2.5 rounded-xl", text: "text-base", icon: 18 },
  lg: { container: "px-6 py-3.5 rounded-xl", text: "text-lg", icon: 20 },
};

export const AppButton = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  iconPosition = "left",
  className: extraClassName,
}: AppButtonProps) => {
  const isDisabled = disabled || loading;
  const vClasses = variantClasses[variant];
  const sClasses = sizeClasses[size];

  const handlePress = () => {
    if (!PLATFORM.IS_WEB) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      className={classNames(
        "flex-row items-center justify-center",
        vClasses.container,
        sClasses.container,
        isDisabled && "opacity-50",
        extraClassName
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "ghost" ? "#6B4EFF" : "#FFFFFF"} />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={sClasses.icon}
              className={classNames("!", vClasses.text)}
              color={variant === "primary" || variant === "destructive" ? "#FFFFFF" : "#6B4EFF"}
            />
          )}
          <AppText className={classNames("font-medium", vClasses.text, sClasses.text)}>
            {title}
          </AppText>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={sClasses.icon}
              color={variant === "primary" || variant === "destructive" ? "#FFFFFF" : "#6B4EFF"}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};
