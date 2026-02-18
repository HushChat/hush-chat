import React, { memo, useEffect, useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface VoiceRecorderUIProps {
  durationMs: number;
  onCancel: () => void;
  onStop: () => void;
  isSending: boolean;
}

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const VoiceRecorderUI = memo(
  ({ durationMs, onCancel, onStop, isSending }: VoiceRecorderUIProps) => {
    const { isDark } = useAppTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }, [pulseAnim]);

    return (
      <View className="flex-row items-center rounded-3xl bg-gray-300/30 dark:bg-secondary-dark px-3 py-2.5 gap-3">
        <Pressable onPress={onCancel} className="p-1.5" accessibilityLabel="Cancel recording">
          <Ionicons
            name="close-circle"
            size={24}
            color={isDark ? "#9ca3af" : "#6b7280"}
          />
        </Pressable>

        <View className="flex-1 flex-row items-center gap-2">
          <Animated.View
            style={{ opacity: pulseAnim }}
            className="w-2.5 h-2.5 rounded-full bg-red-500"
          />
          <AppText className="text-base text-text-primary-light dark:text-text-primary-dark font-medium">
            {formatDuration(durationMs)}
          </AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400">Recording...</AppText>
        </View>

        <Pressable
          onPress={onStop}
          disabled={isSending}
          className="p-1.5"
          accessibilityLabel="Stop and send voice message"
        >
          <Ionicons
            name="send"
            size={22}
            color={isDark ? "#563dc4" : "#6b4eff"}
          />
        </Pressable>
      </View>
    );
  }
);

VoiceRecorderUI.displayName = "VoiceRecorderUI";
