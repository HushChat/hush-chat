import React from "react";
import { TextProps } from "react-native";
import classNames from "classnames";
import { AppText } from "@/components/AppText";

type TypographyVariant = "h1" | "h2" | "h3" | "body" | "bodySmall" | "caption";
type TypographyColor = "primary" | "secondary" | "inverse" | "error" | "success";

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<TypographyVariant, string> = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  body: "text-base",
  bodySmall: "text-sm",
  caption: "text-xs",
};

const colorClasses: Record<TypographyColor, string> = {
  primary: "text-text-primary-light dark:text-text-primary-dark",
  secondary: "text-text-secondary-light dark:text-text-secondary-dark",
  inverse: "text-white dark:text-gray-900",
  error: "text-error",
  success: "text-success",
};

export const Typography = ({
  variant = "body",
  color = "primary",
  className: extraClassName,
  children,
  ...rest
}: TypographyProps) => {
  return (
    <AppText
      className={classNames(variantClasses[variant], colorClasses[color], extraClassName)}
      {...rest}
    >
      {children}
    </AppText>
  );
};
