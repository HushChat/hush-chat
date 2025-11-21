import { chatUserStatus } from "@/types/chat/types";
import { View } from "react-native";
import React from "react";

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
}

const UserStatusIndicator = ({ userStatus = chatUserStatus.OFFLINE }: UserStatusIndicatorProps) => {
  return (
    <View
      className="absolute bottom-0 right-0 border-white w-[12px] h-[12px] rounded-full border-2 bg-[getStatusColor(userStatus)]"
      style={{
        backgroundColor: getStatusColor(userStatus),
      }}
    />
  );
};

export default UserStatusIndicator;
