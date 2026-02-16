import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useCall } from "@/contexts/CallContext";
import { useCallStore } from "@/store/call/useCallStore";
import { useCallTimer } from "@/hooks/call/useCallTimer";
import { CallStatus } from "@/types/call/signalingTypes";
import { getInitials } from "@/utils/commonUtils";

export default function ActiveCallScreen() {
  const { remoteUserName, isMuted, isSpeakerOn, endCall, toggleMute, toggleSpeaker } = useCall();
  const { status, callStartedAt } = useCallStore();
  const timer = useCallTimer(callStartedAt);

  const displayName = remoteUserName || "Unknown";
  const isConnecting = status === CallStatus.CONNECTING;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <AppText style={styles.avatarText}>{getInitials(displayName)}</AppText>
        </View>

        <AppText style={styles.remoteName}>{displayName}</AppText>
        <AppText style={styles.statusText}>
          {isConnecting ? "Connecting..." : timer}
        </AppText>
      </View>

      <View style={styles.bottomControls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
          >
            <Ionicons
              name={isMuted ? "mic-off" : "mic"}
              size={28}
              color={isMuted ? "#1a1a2e" : "#FFFFFF"}
            />
            <AppText style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>
              {isMuted ? "Unmute" : "Mute"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={toggleSpeaker}
          >
            <Ionicons
              name={isSpeakerOn ? "volume-high" : "volume-medium"}
              size={28}
              color={isSpeakerOn ? "#1a1a2e" : "#FFFFFF"}
            />
            <AppText style={[styles.controlLabel, isSpeakerOn && styles.controlLabelActive]}>
              Speaker
            </AppText>
          </TouchableOpacity>
        </View>

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
  remoteName: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  statusText: {
    fontSize: 18,
    color: "#a0a0b8",
  },
  bottomControls: {
    alignItems: "center",
    gap: 40,
  },
  controlRow: {
    flexDirection: "row",
    gap: 40,
  },
  controlButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  controlButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  controlLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    marginTop: 4,
  },
  controlLabelActive: {
    color: "#1a1a2e",
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
