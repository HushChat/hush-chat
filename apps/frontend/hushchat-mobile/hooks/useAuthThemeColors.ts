/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
