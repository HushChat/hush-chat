import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import classNames from "classnames";

type ElevationLevel = "none" | "card" | "elevated" | "sheet";

interface SurfaceProps extends ViewProps {
  elevation?: ElevationLevel;
  className?: string;
  children: React.ReactNode;
}

const elevationStyles: Record<ElevationLevel, ViewStyle> = {
  none: {},
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

const bgClasses: Record<ElevationLevel, string> = {
  none: "bg-background-light dark:bg-background-dark",
  card: "bg-surface-light dark:bg-surface-dark",
  elevated: "bg-surface-elevated-light dark:bg-surface-elevated-dark",
  sheet: "bg-surface-elevated-light dark:bg-surface-elevated-dark",
};

export const Surface = ({
  elevation = "none",
  className: extraClassName,
  children,
  style,
  ...rest
}: SurfaceProps) => {
  return (
    <View
      className={classNames(bgClasses[elevation], "rounded-2xl", extraClassName)}
      style={[elevationStyles[elevation], style]}
      {...rest}
    >
      {children}
    </View>
  );
};
