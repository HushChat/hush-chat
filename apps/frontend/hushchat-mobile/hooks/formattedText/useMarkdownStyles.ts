import { useAppTheme } from "@/hooks/useAppTheme";
import { TextStyle } from "react-native";
import { useMemo } from "react";
import { getMarkdownStyles } from "@/styles/markdown.styles";

export const useMarkdownStyles = (messageTextStyles: TextStyle, isCurrentUser: boolean) => {
  const { isDark } = useAppTheme();

  const textColor = useMemo(() => {
    if (isCurrentUser) return "#FFFFFF";
    return isDark ? "#EDEDED" : "#333333";
  }, [isCurrentUser, isDark]);

  const markdownStyles = getMarkdownStyles(messageTextStyles, textColor);

  return { markdownStyles, messageTextStyles };
};
