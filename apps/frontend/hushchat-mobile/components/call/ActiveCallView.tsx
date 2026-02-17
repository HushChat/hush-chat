import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import CallActionButton from "@/components/call/CallActionButton";
import VideoRenderer from "@/components/call/VideoRenderer";
import { useCallStore } from "@/store/call/useCallStore";
import { useCallDuration } from "@/hooks/call/useCallDuration";
import { CallState } from "@/types/call/callSignaling";

interface ActiveCallViewProps {
  onEndCall: () => void;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
}

const ActiveCallView = ({ onEndCall, onToggleAudio, onToggleVideo }: ActiveCallViewProps) => {
  const activeCall = useCallStore((s) => s.activeCall);
  const localStream = useCallStore((s) => s.localStream);
  const remoteStream = useCallStore((s) => s.remoteStream);
  const duration = useCallDuration();

  if (!activeCall) return null;

  const isConnecting = activeCall.callState === CallState.CONNECTING;
  const isConnected = activeCall.callState === CallState.CONNECTED;
  const displayName = activeCall.callerName ?? activeCall.calleeName ?? "Unknown";
  const displayImage = activeCall.callerImageUrl ?? activeCall.calleeImageUrl;

  return (
    <View className="absolute inset-0 z-50 bg-gray-900">
      {/* Remote video (full screen) or avatar */}
      {activeCall.isVideo && remoteStream && activeCall.isRemoteVideoEnabled ? (
        <VideoRenderer stream={remoteStream} className="absolute inset-0" />
      ) : (
        <View className="flex-1 justify-center items-center">
          <InitialsAvatar name={displayName} size={AvatarSize.large} imageUrl={displayImage} />
          <AppText className="text-white text-2xl font-semibold mt-4">{displayName}</AppText>
        </View>
      )}

      {/* Status / Duration */}
      <View className="absolute top-16 left-0 right-0 items-center">
        {activeCall.isVideo && remoteStream && activeCall.isRemoteVideoEnabled && (
          <AppText className="text-white text-xl font-semibold">{displayName}</AppText>
        )}
        <AppText className="text-gray-300 text-base mt-1">
          {isConnecting ? "Connecting..." : isConnected ? duration : ""}
        </AppText>
      </View>

      {/* Local video PIP */}
      {activeCall.isVideo && localStream && activeCall.isLocalVideoEnabled && (
        <View className="absolute top-24 right-4 w-28 h-40 rounded-xl overflow-hidden border-2 border-gray-700">
          <VideoRenderer stream={localStream} mirror className="flex-1" />
        </View>
      )}

      {/* Bottom toolbar */}
      <View className="absolute bottom-12 left-0 right-0">
        <View className="flex-row justify-center items-center gap-8">
          <View className="items-center gap-1">
            <CallActionButton
              iconName={activeCall.isLocalAudioEnabled ? "mic" : "mic-off"}
              onPress={onToggleAudio}
              backgroundColor={activeCall.isLocalAudioEnabled ? "#374151" : "#EF4444"}
            />
            <AppText className="text-gray-300 text-xs">
              {activeCall.isLocalAudioEnabled ? "Mute" : "Unmute"}
            </AppText>
          </View>

          {activeCall.isVideo && (
            <View className="items-center gap-1">
              <CallActionButton
                iconName={activeCall.isLocalVideoEnabled ? "videocam" : "videocam-off"}
                onPress={onToggleVideo}
                backgroundColor={activeCall.isLocalVideoEnabled ? "#374151" : "#EF4444"}
              />
              <AppText className="text-gray-300 text-xs">
                {activeCall.isLocalVideoEnabled ? "Stop" : "Start"}
              </AppText>
            </View>
          )}

          <View className="items-center gap-1">
            <CallActionButton iconName="call" onPress={onEndCall} backgroundColor="#EF4444" />
            <AppText className="text-gray-300 text-xs">End</AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ActiveCallView;
