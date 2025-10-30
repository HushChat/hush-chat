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
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text } from "react-native";

type AlertType = "error" | "success" | "info" | "warning";

interface AlertProps {
  message: string;
  type: AlertType;
  size?: number;
}

type AlertIcon = {
  name: keyof typeof Ionicons.glyphMap;
  colorLight: string;
  colorDark: string;
};

interface AlertStyle {
  container: string;
  text: string;
  icon: AlertIcon;
}

const alertStyle: Record<AlertType, AlertStyle> = {
  error: {
    container:
      "bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/60",
    text: "text-red-800 dark:text-red-200",
    icon: { name: "alert-circle", colorLight: "#dc2626", colorDark: "#f87171" },
  },
  success: {
    container:
      "bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800/60",
    text: "text-green-800 dark:text-green-200",
    icon: {
      name: "checkmark-circle",
      colorLight: "#16a34a",
      colorDark: "#4ade80",
    },
  },
  info: {
    container:
      "bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60",
    text: "text-blue-800 dark:text-blue-200",
    icon: {
      name: "information-circle",
      colorLight: "#2563eb",
      colorDark: "#60a5fa",
    },
  },
  warning: {
    container:
      "bg-yellow-50 dark:bg-yellow-950/50 border-yellow-200 dark:border-yellow-800/60",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: { name: "warning", colorLight: "#ca8a04", colorDark: "#facc15" },
  },
};

const Alert = ({ message, type, size = 20 }: AlertProps) => {
  const { isDark } = useAppTheme();
  const config = alertStyle[type];
  const iconColor = isDark ? config.icon.colorDark : config.icon.colorLight;

  return (
    <View className="mx-4 my-3">
      <View
        className={`
          relative rounded-lg border p-4
          ${config.container}
        `}
      >
        <View className="flex-row items-start gap-2">
          <Ionicons name={config.icon.name} size={size} color={iconColor} />

          <View className="flex-1">
            <Text className={`text-sm leading-5 ${config.text}`}>
              {message}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Alert;
