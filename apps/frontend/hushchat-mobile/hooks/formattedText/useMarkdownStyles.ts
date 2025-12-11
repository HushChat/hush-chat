import { useAppTheme } from "@/hooks/useAppTheme";
import { useMemo } from "react";
import { getMarkdownStyles } from "@/styles/markdown.styles";

export const useMarkdownStyles = (isCurrentUser: boolean) => {
  const { isDark } = useAppTheme();

  const textColor = useMemo(() => {
    if (isCurrentUser) return "#FFFFFF";
    return isDark ? "#EDEDED" : "#333333";
  }, [isCurrentUser, isDark]);

  const markdownStyles = getMarkdownStyles(textColor);

  return { markdownStyles };
};
