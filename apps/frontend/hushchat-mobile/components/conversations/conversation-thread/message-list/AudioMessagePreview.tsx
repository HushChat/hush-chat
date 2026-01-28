import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import classNames from "classnames";
import { Audio, AVPlaybackStatus } from "expo-av";
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

  console.log(audioUrl);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current.src = ""; // Force the browser to release the stream
        webAudioRef.current = null;
      }

      if (nativeSoundRef.current) {
        const sound = nativeSoundRef.current;
        nativeSoundRef.current = null;
        sound.unloadAsync().catch((err) => logError("Error unloading sound:", err));
      }
    };
  }, []);

  // Web Audio initialization
  const initWebAudio = () => {
    if (!webAudioRef.current) {
      const audio = new window.Audio(audioUrl);
      audio.preload = "metadata";

      audio.onloadedmetadata = () => {
        if (audio.duration && isFinite(audio.duration)) {
          setDuration(Math.floor(audio.duration));
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      audio.onerror = () => {
        logError("Web audio error:", audioUrl);
        setError(true);
      };

      webAudioRef.current = audio;
    }
  };

  // Native Audio initialization
  const initNativeAudio = async () => {
    if (!nativeSoundRef.current) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        nativeSoundRef.current = sound;

        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis) {
          setDuration(Math.floor(status.durationMillis / 1000));
        }

        // Set up status callback for native
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
              setCurrentTime(0);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          }
        });
      } catch (err) {
        logError("Native audio init error:", err);
        setError(true);
      }
    }
  };

  // Web playback handler
  const handleWebPlayPause = async () => {
    if (!webAudioRef.current) initWebAudio();
    const audio = webAudioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        await audio.play();
        setIsPlaying(true);

        // Update progress every 100ms
        intervalRef.current = setInterval(() => {
          setCurrentTime(Math.floor(audio.currentTime));
        }, 100);
      }
    } catch (err) {
      logError("Web play error:", err);
      setError(true);
    }
  };

  // Native playback handler
  const handleNativePlayPause = async () => {
    if (!nativeSoundRef.current) await initNativeAudio();
    const sound = nativeSoundRef.current;
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        await sound.playAsync();
        setIsPlaying(true);

        // Update progress every 100ms
        intervalRef.current = setInterval(async () => {
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.positionMillis !== undefined) {
            setCurrentTime(Math.floor(status.positionMillis / 1000));
          }
        }, 100);
      }
    } catch (err) {
      logError("Native play error:", err);
      setError(true);
    }
  };

  const handlePlayPause = () => {
    if (PLATFORM.IS_WEB) {
      handleWebPlayPause();
    } else {
      handleNativePlayPause();
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
      nativeSoundRef.current.setPositionAsync(newTime * 1000).catch((err) => {
        logError("Seek error:", err);
      });
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
        <AppText className="text-xs text-red-500 ml-2">Unable to load audio</AppText>
      </View>
    );
  }

  return (
    <View className="flex-row items-center p-3 min-w-[250px] max-w-[350px]">
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
