import React from "react";
import { View } from "react-native";
import classNames from "classnames";

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
  indent?: number;
}

export const Divider = ({ orientation = "horizontal", className, indent = 0 }: DividerProps) => {
  if (orientation === "vertical") {
    return (
      <View
        className={classNames("w-px self-stretch bg-divider-light dark:bg-divider-dark", className)}
      />
    );
  }

  return (
    <View
      className={classNames("flex-row", className)}
      style={indent ? { marginLeft: indent } : undefined}
    >
      <View className="flex-1 h-px bg-divider-light dark:bg-divider-dark" />
    </View>
  );
};
