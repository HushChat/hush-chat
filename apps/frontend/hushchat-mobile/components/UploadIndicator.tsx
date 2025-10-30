import { ActivityIndicator, View } from "react-native";
import React from "react";

export default function UploadIndicator({
  isUploading,
}: {
  isUploading: boolean;
}) {
  if (!isUploading) return null;
  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 48,
      }}
    >
      <ActivityIndicator color="#fff" />
    </View>
  );
}
