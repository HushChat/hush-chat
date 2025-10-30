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

import React from "react";
import { View, Text } from "react-native";
import useWebSocketConnection from "@/hooks/useWebSocketConnection";
import { WebSocketStatus } from "@/types/ws/types";

const statusConfig: Record<
  WebSocketStatus,
  { bgClass: string; shadowClass: string; text: string }
> = {
  [WebSocketStatus.Connected]: {
    bgClass: "bg-green-500",
    shadowClass: "shadow-green-500/80",
    text: "Connected",
  },
  [WebSocketStatus.Connecting]: {
    bgClass: "bg-amber-500",
    shadowClass: "shadow-amber-500/80",
    text: "Connecting",
  },
  [WebSocketStatus.Error]: {
    bgClass: "bg-red-500",
    shadowClass: "shadow-red-500/80",
    text: "Error",
  },
  [WebSocketStatus.Disconnected]: {
    bgClass: "bg-red-500",
    shadowClass: "shadow-red-500/80",
    text: "Disconnected",
  },
};

export default function WebSocketStatusIndicator() {
  const { connectionStatus } = useWebSocketConnection();
  const config = statusConfig[connectionStatus];

  return (
    <View className="flex-row items-center gap-1.5">
      <View className="relative">
        <View
          className={`absolute w-3 h-3 rounded-full -top-0.5 -left-0.5 ${config.bgClass} opacity-30`}
        />
        <View
          className={`w-2 h-2 rounded-full ${config.bgClass} shadow-lg ${config.shadowClass}`}
        />
      </View>
      <Text className="text-xs text-gray-600 dark:text-gray-400">
        {config.text}
      </Text>
    </View>
  );
}
