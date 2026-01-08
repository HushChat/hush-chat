import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { logError } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SOUND_ENABLED_KEY } from "@/constants/constants";

export enum SoundType {
  NORMAL = "NORMAL",
  MENTION = "MENTION",
}

let messageSound: AudioPlayer | null = null;
let mentionSound: AudioPlayer | null = null;

let loadingPromise: Promise<void> | null = null;
let isSoundEnabled: boolean = true;
let isSettingsLoaded = false;

export const setCachedSoundEnabled = (enabled: boolean) => {
  isSoundEnabled = enabled;
  isSettingsLoaded = true;
};

export const loadMessageSound = () => {
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      if (!messageSound) {
        const audioSource = require("@/assets/sounds/message-pop.mp3");
        messageSound = createAudioPlayer(audioSource);
      }
      if (!mentionSound) {
        const audioSource = require("@/assets/sounds/message-mention-pop.mp3");
        mentionSound = createAudioPlayer(audioSource);
      }

      if (!isSettingsLoaded) {
        const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
        if (!isSettingsLoaded) {
          isSoundEnabled = soundEnabled !== "false";
          isSettingsLoaded = true;
        }
      }
    } catch (error) {
      logError("Failed to load message sounds", error);
    } finally {
      loadingPromise = null;
    }
  })();

  return loadingPromise;
};

export const playMessageSound = async (type: SoundType) => {
  try {
    if (!messageSound || !mentionSound) {
      await loadMessageSound();
    }

    if (!isSoundEnabled) {
      return;
    }

    const soundToPlay = type === SoundType.MENTION ? mentionSound : messageSound;

    if (soundToPlay) {
      soundToPlay.seekTo(0);
      soundToPlay.play();
    }
  } catch (error) {
    logError("Failed to play message sound:", error);
  }
};
