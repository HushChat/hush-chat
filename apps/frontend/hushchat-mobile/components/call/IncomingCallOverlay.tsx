import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useCall } from "@/contexts/CallContext";
import { getInitials } from "@/utils/commonUtils";

export default function IncomingCallOverlay() {
  const { remoteUserName, isVideo, acceptCall, rejectCall } = useCall();

  const displayName = remoteUserName || "Unknown";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <AppText style={styles.avatarText}>{getInitials(displayName)}</AppText>
        </View>

        <AppText style={styles.callerName}>{displayName}</AppText>
        <AppText style={styles.callType}>
          Incoming {isVideo ? "Video" : "Audio"} Call...
        </AppText>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.rejectButton} onPress={rejectCall}>
            <Ionicons name="call" size={32} color="#FFFFFF" style={styles.rejectIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.acceptButton} onPress={acceptCall}>
            <Ionicons name="call" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4a4a6a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarText: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  callerName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  callType: {
    fontSize: 16,
    color: "#a0a0b8",
    marginBottom: 80,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 60,
  },
  rejectButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectIcon: {
    transform: [{ rotate: "135deg" }],
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
});
