import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { Audio, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import { PLATFORM } from "@/constants/platformConstants";
import { logError } from "@/utils/logger";

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
  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const nativeSoundRef = useRef<Audio.Sound | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [error, setError] = useState(false);
  const [trackWidth, setTrackWidth] = useState<number>(0);

  const [soundSource, setSoundSource] = useState<string | null>(null);
  const [isCaching, setIsCaching] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setIsCaching(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setError(false);

    const cacheAudio = async () => {
      try {
        if (PLATFORM.IS_WEB) {
          const response = await fetch(audioUrl);
          if (!response.ok) throw new Error("Network response was not ok");

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          if (isMounted) {
            setSoundSource(blobUrl);
            setIsCaching(false);
          }
        } else {
          const urlWithoutParams = audioUrl.split("?")[0];
          const fileName = urlWithoutParams.split("/").pop() || `audio_${Date.now()}`;
          const cleanFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");

          const cacheDir = (FileSystem as any).cacheDirectory;
          const fileUri = `${cacheDir}audio_${cleanFileName}`;

          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          if (fileInfo.exists) {
            if (isMounted) {
              setSoundSource(fileUri);
              setIsCaching(false);
            }
          } else {
            // Download new file
            const { uri } = await FileSystem.downloadAsync(audioUrl, fileUri);
            if (isMounted) {
              setSoundSource(uri);
              setIsCaching(false);
            }
          }
        }
      } catch (err) {
        console.warn("Cache/Download failed, falling back to stream", err);
        if (isMounted) {
          setSoundSource(audioUrl);
          setIsCaching(false);
        }
      }
    };

    if (audioUrl) {
      cacheAudio();
    }

    // When audioUrl changes, destroy the OLD player immediately
    return () => {
      isMounted = false;
      cleanupAudioPlayers();
    };
  }, [audioUrl]);

  // Helper to destroy players
  const cleanupAudioPlayers = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Cleanup Web
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.src = "";
      webAudioRef.current = null;
    }

    // Cleanup Native
    if (nativeSoundRef.current) {
      const sound = nativeSoundRef.current;
      nativeSoundRef.current = null; // Detach ref first

      await sound.unloadAsync();
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Only fetch duration on WEB. Native calculates it upon Play to save resources.
    if (PLATFORM.IS_WEB && !providedDuration && soundSource) {
      const tempAudio = new window.Audio(soundSource);
      tempAudio.onloadedmetadata = () => {
        if (isMounted && tempAudio.duration && isFinite(tempAudio.duration)) {
          setDuration(Math.floor(tempAudio.duration));
        }
      };
    }

    return () => {
      isMounted = false;
    };
  }, [soundSource, providedDuration]);

  const initWebAudio = () => {
    if (!webAudioRef.current && soundSource) {
      const audio = new window.Audio(soundSource);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      audio.onerror = () => {
        console.error("Web audio playback error");
        if (soundSource !== audioUrl) {
          setSoundSource(audioUrl);
        } else {
          setError(true);
        }
      };

      webAudioRef.current = audio;
    }
  };

  const initNativeAudio = async () => {
    if (!nativeSoundRef.current && soundSource) {
      try {
        if (soundSource.startsWith("blob:")) return;

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: soundSource },
          { shouldPlay: false }
        );

        nativeSoundRef.current = sound;

        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDuration(Math.floor(status.durationMillis / 1000));
        }

        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTime(0);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        });
      } catch (err) {
        logError("Native audio init error:", err);
        setError(true);
      }
    }
  };

  const handlePlayPause = async () => {
    setError(false);
    if (!soundSource) return;

    if (PLATFORM.IS_WEB) {
      if (!webAudioRef.current) initWebAudio();
      const audio = webAudioRef.current;
      if (!audio) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        await audio.play();
        setIsPlaying(true);
        intervalRef.current = setInterval(() => {
          setCurrentTime(Math.floor(audio.currentTime));
        }, 100);
      }
    } else {
      if (!nativeSoundRef.current) await initNativeAudio();
      const sound = nativeSoundRef.current;
      if (!sound) return;

      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        intervalRef.current = setInterval(async () => {
          if (!nativeSoundRef.current) return;
          try {
            const status = await sound.getStatusAsync();
            if (status.isLoaded && status.positionMillis !== undefined) {
              setCurrentTime(Math.floor(status.positionMillis / 1000));
            }
          } catch (e) {
            console.log(e);
          }
        }, 100);
      }
    }
  };

  const handleSeek = (event: GestureResponderEvent) => {
    if (!trackWidth || !duration) return;
    const { locationX } = event.nativeEvent;
    const percentage = Math.max(0, Math.min(1, locationX / trackWidth));
    const newTime = Math.floor(percentage * duration);
    setCurrentTime(newTime);

    if (PLATFORM.IS_WEB && webAudioRef.current) {
      webAudioRef.current.currentTime = newTime;
    } else if (nativeSoundRef.current) {
      nativeSoundRef.current.setPositionAsync(newTime * 1000).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <View className="flex-row items-center p-3">
        <Ionicons name="alert-circle" size={20} color="#EF4444" />
        <AppText className="text-xs text-red-500 ml-2">Unavailable</AppText>
      </View>
    );
  }

  if (isCaching) {
    return (
      <View className="flex-row items-center min-w-[250px] p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
        {/* Fixed: Removed animate-pulse to prevent crash */}
        <View className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 mr-3" />
        <AppText className="text-xs text-gray-400">Loading...</AppText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center min-w-[250px] max-w-[350px]">
      <Pressable
        onPress={handlePlayPause}
        className={classNames(
          "w-10 h-10 rounded-full items-center justify-center mr-3",
          isCurrentUser ? "bg-white/20" : "bg-primary-light/10 dark:bg-primary-dark/10"
        )}
      >
        <Ionicons
          name={isPlaying ? "pause" : "play"}
          size={20}
          color={isCurrentUser ? "#FFFFFF" : "#3B82F6"}
        />
      </Pressable>

      <View className="flex-1">
        <Pressable onPress={handleSeek} className="h-8 justify-center">
          <View
            className={classNames(
              "h-1 rounded-full overflow-hidden",
              isCurrentUser ? "bg-white/20" : "bg-gray-300 dark:bg-gray-600"
            )}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
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

      <Ionicons name="musical-notes" size={16} color={isCurrentUser ? "#FFFFFF99" : "#9CA3AF"} />
    </View>
  );
};
