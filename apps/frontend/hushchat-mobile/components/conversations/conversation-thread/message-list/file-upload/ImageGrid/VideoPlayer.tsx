import React, { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

export const VideoPlayer = ({ uri, style }: { uri?: string; style: any }) => {
  const [hasError, setHasError] = useState<boolean>(false);

  if (hasError) return <ErrorView style={style} />;

  return (
    <video
      src={uri}
      style={style}
      controls
      preload="metadata"
      className="rounded-lg"
      onError={() => setHasError(true)}
    >
      Your browser does not support the video tag.
    </video>
  );
};

const ErrorView = ({ style }: { style: any }) => (
  <View
    className="justify-center items-center bg-neutral-900 overflow-hidden w-full h-full rounded-lg p-2"
    style={style}
  >
    <Ionicons name="alert-circle" size={40} color="#ef4444" />
    <AppText className="text-red-500 mt-2 font-medium">Upload failed. Re-upload again</AppText>
  </View>
);
