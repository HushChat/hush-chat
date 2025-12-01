import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import classNames from "classnames";

interface AudioMessagePreviewProps {
  audioUrl: string;
  isCurrentUser: boolean;
  duration?: number;
}

export const AudioMessagePreview = ({
  audioUrl,
  isCurrentUser,
  duration: providedDuration,
}: AudioMessagePreviewProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener("loadedmetadata", () => {
        setDuration(Math.floor(audio.duration));
        setIsLoading(false);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(Math.floor(audio.currentTime));
      });

      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
        audio.currentTime = 0;
      });

      audio.addEventListener("error", () => {
        setError(true);
        setIsLoading(false);
      });

      return () => {
        audio.pause();
        audio.src = "";
        audio.load();
      };
    }
  }, [audioUrl]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setError(true);
          setIsLoading(false);
        });
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(Math.floor(newTime));
    },
    [duration]
  );

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View className="flex-row items-center p-3 min-w-[200px]">
        <Ionicons name="alert-circle" size={20} className="text-red-500 mr-2" />
        <AppText className="text-sm text-red-500">Unable to load audio</AppText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center p-3 min-w-[250px] max-w-[350px]">
      {/* Play/Pause Button */}
      <Pressable
        onPress={handlePlayPause}
        className={classNames(
          "w-10 h-10 rounded-full items-center justify-center mr-3",
          isCurrentUser ? "bg-white/20" : "bg-primary-light/10 dark:bg-primary-dark/10"
        )}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={isCurrentUser ? "#FFFFFF" : "#3B82F6"} />
        ) : (
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            className={classNames(
              isCurrentUser ? "text-white" : "text-primary-light dark:text-primary-dark"
            )}
          />
        )}
      </Pressable>

      {/* Waveform/Progress Bar */}
      <View className="flex-1">
        <Pressable onPress={handleSeek} className="h-8 justify-center">
          <View
            className={classNames(
              "h-1 rounded-full overflow-hidden",
              isCurrentUser ? "bg-white/20" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <View
              className={classNames(
                "h-full rounded-full",
                isCurrentUser ? "bg-white" : "bg-primary-light dark:bg-primary-dark"
              )}
              style={{ width: `${progress}%` }}
            />
          </View>
        </Pressable>

        {/* Time Display */}
        <View className="flex-row justify-between mt-1">
          <AppText
            className={classNames(
              "text-xs",
              isCurrentUser ? "text-white/80" : "text-gray-600 dark:text-gray-400"
            )}
          >
            {formatTime(currentTime)}
          </AppText>
          <AppText
            className={classNames(
              "text-xs",
              isCurrentUser ? "text-white/80" : "text-gray-600 dark:text-gray-400"
            )}
          >
            {formatTime(duration)}
          </AppText>
        </View>
      </View>

      {/* Audio Icon */}
      <Ionicons
        name="musical-notes"
        size={16}
        className={classNames(
          "ml-2",
          isCurrentUser ? "text-white/60" : "text-gray-400 dark:text-gray-500"
        )}
      />
    </View>
  );
};
