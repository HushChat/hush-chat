import { useAppTheme } from "@/hooks/useAppTheme";
import { StyleSheet, TextStyle } from "react-native";
import { useMemo } from "react";
import { getMarkdownStyles } from "@/styles/markdown.styles";

export const useMarkdownStyles = (
  style: TextStyle | TextStyle[] | undefined,
  isCurrentUser: boolean
) => {
  const { isDark } = useAppTheme();

  const flatStyle = useMemo(() => StyleSheet.flatten(style || {}), [style]);

  const textColor = useMemo(() => {
    if (flatStyle.color) return flatStyle.color as string;
    if (isCurrentUser) return "#FFFFFF";
    return isDark ? "#EDEDED" : "#333333";
  }, [flatStyle.color, isCurrentUser, isDark]);

  const baseSpecs = useMemo(
    () => ({
      fontFamily: flatStyle.fontFamily || "Poppins-Regular",
      fontSize: flatStyle.fontSize || 16,
      lineHeight: flatStyle.lineHeight || 22,
      color: textColor,
    }),
    [flatStyle, textColor]
  );

  const markdownStyles = useMemo(() => getMarkdownStyles(baseSpecs), [baseSpecs]);

  return { markdownStyles, baseSpecs };
};
