import { chatUserStatus, DeviceType } from "@/types/chat/types";
import { View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

const StatusColorMap: Record<string, string> = {
  [chatUserStatus.ONLINE]: "#22C55E",
  [chatUserStatus.OFFLINE]: "#9CA3AF",
  [chatUserStatus.AWAY]: "#F59E0B",
  [chatUserStatus.BUSY]: "#EF4444",
};

const getStatusColor = (status: string): string => {
  return StatusColorMap[status] || "#9CA3AF";
};

interface UserStatusIndicatorProps {
  userStatus?: chatUserStatus;
  deviceType?: DeviceType;
}

const UserStatusIndicator = ({
  userStatus = chatUserStatus.OFFLINE,
  deviceType,
}: UserStatusIndicatorProps) => {
  const color = getStatusColor(userStatus);

  if (deviceType) {
    const iconName = deviceType === "WEB" ? "laptop-outline" : "phone-portrait-outline";

    return (
      <View
        className="absolute bottom-0 right-0 bg-background-light dark:bg-background-dark rounded-full items-center justify-center border-2 border-white dark:border-gray-900"
        style={{ width: 18, height: 18 }}
      >
        <Ionicons name={iconName} size={10} color={color} />
      </View>
    );
  }

  return (
    <View
      className="absolute bottom-0 right-0 border-white dark:border-gray-900 w-[12px] h-[12px] rounded-full border-2"
      style={{
        backgroundColor: color,
      }}
    />
  );
};

export default UserStatusIndicator;
