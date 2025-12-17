import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { logError } from "@/utils/logger";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOUND_KEY = "sound_enabled";
let messageSound: AudioPlayer | null = null;

export const loadMessageSound = async () => {
  if (!messageSound) {
    const audioSource = require("@/assets/sounds/message-pop.mp3");
    messageSound = createAudioPlayer(audioSource);
  }
};

export const playMessageSound = async (isConversationMuted = false) => {
  try {
    const soundEnabled = await AsyncStorage.getItem(SOUND_KEY);
    if (soundEnabled === "false" || isConversationMuted) {
      return;
    }

    if (!messageSound) await loadMessageSound();
    if (messageSound) {
      messageSound.seekTo(0);
      messageSound.play();
    }
  } catch (error) {
    logError("Failed to play message sound:", error);
  }
};
