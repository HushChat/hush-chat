import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import CallActionButton from "@/components/call/CallActionButton";
import { useCallStore } from "@/store/call/useCallStore";

interface OutgoingCallOverlayProps {
  onCancel: () => void;
}

const OutgoingCallOverlay = ({ onCancel }: OutgoingCallOverlayProps) => {
  const activeCall = useCallStore((s) => s.activeCall);

  if (!activeCall) return null;

  const displayName = activeCall.calleeName ?? "Unknown";

  return (
    <View className="absolute inset-0 z-50 bg-gray-900 justify-between items-center py-20">
      <View className="items-center gap-4 mt-16">
        <InitialsAvatar
          name={displayName}
          size={AvatarSize.large}
          imageUrl={activeCall.calleeImageUrl}
        />
        <AppText className="text-white text-2xl font-semibold">{displayName}</AppText>
        <AppText className="text-gray-300 text-lg">Calling...</AppText>
      </View>

      <View className="items-center gap-2 mb-12">
        <CallActionButton iconName="call" onPress={onCancel} backgroundColor="#EF4444" />
        <AppText className="text-gray-300 text-sm">Cancel</AppText>
      </View>
    </View>
  );
};

export default OutgoingCallOverlay;
