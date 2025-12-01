import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { Audio } from "expo-av";
import { PLATFORM } from "@/constants/platformConstants";
import { logError, logInfo } from "@/utils/logger";

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
  // Web audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Native audio ref
  const soundRef = useRef<Audio.Sound | null>(null);
  // Track if component is mounted
  const isMountedRef = useRef(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Web audio setup
  useEffect(() => {
    if (PLATFORM.IS_WEB && audioUrl) {
      isMountedRef.current = true;

      const audio = new window.Audio();
      audioRef.current = audio;

      const handleLoadStart = () => {
        if (!isMountedRef.current) return;
        setIsLoading(true);
        setError(false);
      };

      const handleLoadedMetadata = () => {
        if (!isMountedRef.current) return;
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          setDuration(Math.floor(audio.duration));
        }
        setIsLoading(false);
      };

      const handleCanPlay = () => {
        if (!isMountedRef.current) return;
        setIsLoading(false);
      };

      const handleTimeUpdate = () => {
        if (!isMountedRef.current) return;
        setCurrentTime(Math.floor(audio.currentTime));
      };

      const handleEnded = () => {
        if (!isMountedRef.current) return;
        setIsPlaying(false);
        setCurrentTime(0);
        audio.currentTime = 0;
      };

      const handleError = (e: Event) => {
        // Ignore errors if component is unmounted
        if (!isMountedRef.current) {
          return;
        }

        const errorTarget = e.target as HTMLAudioElement;
        const errorCode = errorTarget.error?.code;
        const errorMsg = errorTarget.error?.message;

        logError("Audio loading error:", {
          code: errorCode,
          message: errorMsg,
          url: audioUrl,
          networkState: audio.networkState,
          readyState: audio.readyState,
        });

        // Provide more specific error messages
        let userMessage = "Unable to load audio";
        if (errorCode === 4) {
          userMessage = "Audio format not supported";
        } else if (errorCode === 2) {
          userMessage = "Network error loading audio";
        } else if (errorCode === 3) {
          userMessage = "Audio file corrupted";
        }

        setError(true);
        setErrorMessage(userMessage);
        setIsLoading(false);
      };

      audio.addEventListener("loadstart", handleLoadStart);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      audio.preload = "metadata";
      audio.src = audioUrl;
      audio.load();

      return () => {
        isMountedRef.current = false;

        audio.removeEventListener("loadstart", handleLoadStart);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);

        audio.pause();
        audio.src = "";
        audio.load();
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Native audio setup
  useEffect(() => {
    if (audioUrl) {
      let isMounted = true;

      const setupSound = async () => {
        try {
          // Set audio mode for playback
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });

          const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: false, progressUpdateIntervalMillis: 100 },
            (status) => {
              if (!isMounted) return;

              if (status.isLoaded) {
                if (status.durationMillis && !duration) {
                  setDuration(Math.floor(status.durationMillis / 1000));
                }
                if (status.positionMillis !== undefined) {
                  setCurrentTime(Math.floor(status.positionMillis / 1000));
                }
                if (status.didJustFinish) {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }
                if (status.isPlaying !== isPlaying) {
                  setIsPlaying(status.isPlaying);
                }
              } else if (status.error) {
                logError("Native audio error:", status.error);
                if (isMounted) {
                  setError(true);
                  setErrorMessage("Playback error");
                }
              }
            }
          );

          if (isMounted) {
            soundRef.current = sound;
            setIsLoading(false);
          }
        } catch (error) {
          logError("Failed to load native audio:", error, "URL:", audioUrl);
          if (isMounted) {
            setError(true);
            setErrorMessage("Failed to load audio");
            setIsLoading(false);
          }
        }
      };

      void setupSound();

      return () => {
        isMounted = false;
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch((err) => {
            logError("Failed to unload sound:", err);
          });
          soundRef.current = null;
        }
      };
    }
  }, [audioUrl]);

  const handlePlayPause = useCallback(async () => {
    if (PLATFORM.IS_WEB) {
      if (!audioRef.current || !isMountedRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        audioRef.current
          .play()
          .then(() => {
            if (!isMountedRef.current) return;
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch((err) => {
            if (!isMountedRef.current) return;
            logError("Failed to play audio:", err);
            setError(true);
            setErrorMessage("Playback failed");
            setIsLoading(false);
          });
      }
    } else {
      // Native
      if (!soundRef.current) return;

      try {
        const status = await soundRef.current.getStatusAsync();
        if (!status.isLoaded) {
          logError("Sound not loaded");
          return;
        }

        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          setIsLoading(true);
          await soundRef.current.playAsync();
          setIsPlaying(true);
          setIsLoading(false);
        }
      } catch (error) {
        logError("Failed to play/pause native audio:", error);
        setError(true);
        setErrorMessage("Playback failed");
        setIsLoading(false);
      }
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    async (event: any) => {
      if (PLATFORM.IS_WEB) {
        if (!audioRef.current || !isMountedRef.current || !duration) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        audioRef.current.currentTime = newTime;
        setCurrentTime(Math.floor(newTime));
      } else {
        // Native
        if (!soundRef.current) return;

        try {
          const status = await soundRef.current.getStatusAsync();
          if (!status.isLoaded || !status.durationMillis) return;

          const { locationX } = event.nativeEvent;
          const progressBarWidth = 200;
          const percentage = Math.max(0, Math.min(1, locationX / progressBarWidth));
          const newTimeMs = percentage * status.durationMillis;

          await soundRef.current.setPositionAsync(newTimeMs);
          setCurrentTime(Math.floor(newTimeMs / 1000));
        } catch (error) {
          logError("Failed to seek audio:", error);
        }
      }
    },
    [duration]
  );

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View className="flex-row items-center p-3 min-w-[200px] max-w-[300px]">
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
        <View className="flex-1 ml-2">
          <AppText className="text-xs text-red-500">
            {errorMessage || "Unable to load audio"}
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center p-3 min-w-[250px] max-w-[350px]">
      {/* Play/Pause Button */}
      <Pressable
        onPress={handlePlayPause}
        disabled={isLoading || error}
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
            color={isCurrentUser ? "#FFFFFF" : "#3B82F6"}
          />
        )}
      </Pressable>

      {/* Waveform/Progress Bar */}
      <View className="flex-1">
        <Pressable
          onPress={handleSeek}
          disabled={isLoading || error || !duration}
          className="h-8 justify-center"
        >
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
      <Ionicons name="musical-notes" size={16} color={isCurrentUser ? "#FFFFFF99" : "#9CA3AF"} />
    </View>
  );
};
