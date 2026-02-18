import React, { memo, useCallback } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { AppText } from "@/components/AppText";
import { IMessageAttachment } from "@/types/chat/types";
import { useAppTheme } from "@/hooks/useAppTheme";

interface VoiceMessagePlayerProps {
  attachment: IMessageAttachment;
  isCurrentUser: boolean;
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return "--:--";
  const totalSec = Math.floor(seconds);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const VoiceMessagePlayer = memo(
  ({ attachment, isCurrentUser }: VoiceMessagePlayerProps) => {
    const { isDark } = useAppTheme();
    const player = useAudioPlayer(attachment.fileUrl, { updateInterval: 200 });
    const status = useAudioPlayerStatus(player);

    const isPlaying = status.playing;
    const isLoaded = status.isLoaded;
    const duration = status.duration || 0;
    const currentTime = status.currentTime || 0;
    const progress = duration > 0 ? currentTime / duration : 0;

    const handleTogglePlay = useCallback(() => {
      if (!isLoaded) return;

      if (status.didJustFinish) {
        player.seekTo(0);
        player.play();
        return;
      }

      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }, [player, isPlaying, isLoaded, status.didJustFinish]);

    const iconColor = isCurrentUser
      ? isDark
        ? "#e5e7eb"
        : "#374151"
      : isDark
        ? "#d1d5db"
        : "#4b5563";

    const progressBgColor = isCurrentUser
      ? isDark
        ? "bg-white/20"
        : "bg-gray-400/30"
      : isDark
        ? "bg-white/15"
        : "bg-gray-300/50";

    const progressFillColor = isCurrentUser
      ? isDark
        ? "bg-white/60"
        : "bg-gray-700"
      : isDark
        ? "bg-gray-300"
        : "bg-gray-600";

    return (
      <View className="flex-row items-center gap-2.5 py-1 px-1 min-w-[200px]">
        <Pressable
          onPress={handleTogglePlay}
          className="w-9 h-9 rounded-full items-center justify-center bg-black/10 dark:bg-white/10"
          accessibilityLabel={isPlaying ? "Pause voice message" : "Play voice message"}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={18}
            color={iconColor}
          />
        </Pressable>

        <View className="flex-1 gap-1">
          <View className={`h-1 rounded-full ${progressBgColor} overflow-hidden`}>
            <View
              className={`h-full rounded-full ${progressFillColor}`}
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </View>

          <View className="flex-row justify-between">
            <AppText className="text-xs text-gray-500 dark:text-gray-400">
              {isPlaying || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
            </AppText>
            {(isPlaying || currentTime > 0) && duration > 0 && (
              <AppText className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(duration)}
              </AppText>
            )}
          </View>
        </View>
      </View>
    );
  }
);

VoiceMessagePlayer.displayName = "VoiceMessagePlayer";
