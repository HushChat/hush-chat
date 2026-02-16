import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useCall } from "@/contexts/CallContext";
import { getInitials } from "@/utils/commonUtils";

export default function OutgoingCallScreen() {
  const { remoteUserName, endCall } = useCall();

  const displayName = remoteUserName || "Unknown";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <AppText style={styles.avatarText}>{getInitials(displayName)}</AppText>
        </View>

        <AppText style={styles.calleeName}>{displayName}</AppText>
        <AppText style={styles.statusText}>Calling...</AppText>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.endCallButton} onPress={endCall}>
          <Ionicons name="call" size={32} color="#FFFFFF" style={styles.endCallIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a2e",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    paddingTop: 60,
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
  calleeName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  statusText: {
    fontSize: 16,
    color: "#a0a0b8",
  },
  bottomControls: {
    alignItems: "center",
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  endCallIcon: {
    transform: [{ rotate: "135deg" }],
  },
});
