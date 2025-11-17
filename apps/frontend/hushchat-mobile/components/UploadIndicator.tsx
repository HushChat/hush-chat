import { ActivityIndicator, View, StyleSheet } from "react-native";
import React from "react";

const COLORS = {
  OVERLAY: "rgba(0, 0, 0, 0.3)",
  SPINNER: "#FFFFFF",
};

export default function UploadIndicator({ isUploading }: { isUploading: boolean }) {
  if (!isUploading) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator color={COLORS.SPINNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.OVERLAY,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 48,
  },
});
