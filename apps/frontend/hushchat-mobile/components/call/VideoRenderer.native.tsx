import React from "react";
import { View } from "react-native";
import { RTCView } from "react-native-webrtc";

interface VideoRendererProps {
  stream: MediaStream | null;
  mirror?: boolean;
  className?: string;
}

const VideoRenderer = ({ stream, mirror = false, className }: VideoRendererProps) => {
  if (!stream) return null;

  return (
    <View className={className}>
      <RTCView
        streamURL={(stream as any).toURL()}
        mirror={mirror}
        objectFit="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
};

export default VideoRenderer;
