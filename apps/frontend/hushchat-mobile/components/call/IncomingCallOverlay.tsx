import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import CallActionButton from "@/components/call/CallActionButton";
import { useCallStore } from "@/store/call/useCallStore";

interface IncomingCallOverlayProps {
  onAccept: () => void;
  onReject: () => void;
}

const IncomingCallOverlay = ({ onAccept, onReject }: IncomingCallOverlayProps) => {
  const activeCall = useCallStore((s) => s.activeCall);

  if (!activeCall) return null;

  const displayName = activeCall.callerName ?? "Unknown";

  return (
    <View className="absolute inset-0 z-50 bg-gray-900 justify-between items-center py-20">
      <View className="items-center gap-4 mt-16">
        <InitialsAvatar
          name={displayName}
          size={AvatarSize.large}
          imageUrl={activeCall.callerImageUrl}
        />
        <AppText className="text-white text-2xl font-semibold">{displayName}</AppText>
        <AppText className="text-gray-300 text-lg">
          {activeCall.isVideo ? "Incoming Video Call..." : "Incoming Voice Call..."}
        </AppText>
      </View>

      <View className="flex-row items-center gap-16 mb-12">
        <View className="items-center gap-2">
          <CallActionButton iconName="close" onPress={onReject} backgroundColor="#EF4444" />
          <AppText className="text-gray-300 text-sm">Decline</AppText>
        </View>
        <View className="items-center gap-2">
          <CallActionButton iconName="checkmark" onPress={onAccept} backgroundColor="#22C55E" />
          <AppText className="text-gray-300 text-sm">Accept</AppText>
        </View>
      </View>
    </View>
  );
};

export default IncomingCallOverlay;
