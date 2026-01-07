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

export const loadMessageSound = async () => {
  if (!messageSound) {
    const audioSource = require("@/assets/sounds/message-pop.mp3");
    messageSound = createAudioPlayer(audioSource);
  }
  if (!mentionSound) {
    const audioSource = require("@/assets/sounds/message-mention-pop.mp3");
    mentionSound = createAudioPlayer(audioSource);
  }
};

export const playMessageSound = async (
  isConversationMuted = false,
  type: SoundType = SoundType.NORMAL
) => {
  try {
    const soundEnabled = await AsyncStorage.getItem(SOUND_ENABLED_KEY);
    if (soundEnabled === "false" || isConversationMuted) {
      return;
    }

    if (!messageSound || !mentionSound) await loadMessageSound();

    const soundToPlay = type === SoundType.MENTION ? mentionSound : messageSound;

    if (soundToPlay) {
      soundToPlay.seekTo(0);
      soundToPlay.play();
    }
  } catch (error) {
    logError("Failed to play message sound:", error);
  }
};
