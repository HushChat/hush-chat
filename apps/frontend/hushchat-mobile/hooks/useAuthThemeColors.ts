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
    // New colors for redesigned auth
    gradientStart: "#7C3AED",
    gradientEnd: "#5B21B6",
    formBackground: isDark ? "#0a0f1a" : "#ffffff",
    logoText: isDark ? "#ffffff" : "#ffffff", // Always white on gradient
    featureText: isDark ? "#D1C8FF" : "#D1C8FF", // Always light on gradient
  };

  return { colors, isDark };
};
