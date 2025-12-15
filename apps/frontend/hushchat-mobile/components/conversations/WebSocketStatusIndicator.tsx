import React from "react";
import { View } from "react-native";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { WebSocketStatus } from "@/types/ws/types";
import { AppText } from "@/components/AppText";

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
  const { connectionStatus } = useWebSocket();
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
      <AppText className="text-xs text-gray-600 dark:text-gray-400">{config.text}</AppText>
    </View>
  );
}
