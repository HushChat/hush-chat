import React, { useMemo } from "react";
import { View } from "react-native";
import classNames from "classnames";
import { AppText } from "@/components/AppText";

type BadgeVariant = "primary" | "success" | "error" | "muted";

interface BadgeProps {
  count?: number;
  variant?: BadgeVariant;
  dot?: boolean;
  maxCount?: number;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: "bg-primary-light dark:bg-primary-dark",
  success: "bg-success",
  error: "bg-error",
  muted: "bg-gray-400 dark:bg-gray-600",
};

export const Badge = ({
  count,
  variant = "primary",
  dot = false,
  maxCount = 99,
  className: extraClassName,
}: BadgeProps) => {
  const display = useMemo(() => {
    if (dot || count === undefined) return null;
    return count > maxCount ? `${maxCount}+` : String(count);
  }, [count, dot, maxCount]);

  if (dot) {
    return (
      <View
        className={classNames("w-2.5 h-2.5 rounded-full", variantClasses[variant], extraClassName)}
      />
    );
  }

  if (!count || count <= 0) return null;

  return (
    <View
      className={classNames(
        "rounded-full min-w-[20px] h-5 px-1.5 items-center justify-center",
        variantClasses[variant],
        extraClassName
      )}
      accessibilityRole="text"
      accessibilityLabel={`${display}`}
    >
      <AppText className="text-xs font-semibold text-white" numberOfLines={1}>
        {display}
      </AppText>
    </View>
  );
};
