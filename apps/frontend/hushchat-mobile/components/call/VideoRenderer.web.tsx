import React, { useEffect, useRef } from "react";
import { View } from "react-native";

interface VideoRendererProps {
  stream: MediaStream | null;
  mirror?: boolean;
  className?: string;
}

const VideoRenderer = ({ stream, mirror = false, className }: VideoRendererProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <View className={className}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={mirror}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: mirror ? "scaleX(-1)" : undefined,
        }}
      />
    </View>
  );
};

export default VideoRenderer;
