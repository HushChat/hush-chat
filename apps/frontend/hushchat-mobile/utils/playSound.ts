import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { logError } from "@/utils/logger";
import { useConversationStore } from "@/store/conversation/useConversationStore"; // Import the store

let messageSound: AudioPlayer | null = null;

export const loadMessageSound = async () => {
  if (!messageSound) {
    const audioSource = require("@/assets/sounds/message-pop.mp3");
    messageSound = createAudioPlayer(audioSource);
  }
};

export const playMessageSound = async () => {
  try {
    const { isSoundEnabled } = useConversationStore.getState();

    if (!isSoundEnabled) {
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
