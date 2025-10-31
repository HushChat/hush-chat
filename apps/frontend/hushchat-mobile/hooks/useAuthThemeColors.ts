import { useAppTheme } from "@/hooks/useAppTheme";

export const useAuthThemeColors = () => {
  const { isDark } = useAppTheme();

  const colors = {
    background: isDark ? "#090f1d" : "#fafafa",
    primary: isDark ? "#563dc4" : "#6B4EFF",
    secondary: isDark ? "#1A243A" : "#F5F3FF",
    textPrimary: isDark ? "#ffffff" : "#111827",
    textSecondary: isDark ? "#9ca3af" : "#6B7280",
    inputBackground: isDark ? "#090f1d" : "#F5F3FF",
    inputBorder: isDark ? "#374151" : "#e5e7eb",
    inputFocusBorder: isDark ? "#563dc4" : "#6B4EFF",
    buttonDisabled: isDark ? "#374151" : "#d1d5db",
    textDisabled: isDark ? "#374151" : "#d1d5db",
  };

  return { colors, isDark };
};
