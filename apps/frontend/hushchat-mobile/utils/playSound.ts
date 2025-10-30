import { createAudioPlayer } from "expo-audio";
import type { AudioPlayer } from "expo-audio";

let messageSound: AudioPlayer | null = null;

export const loadMessageSound = async () => {
  if (!messageSound) {
    const audioSource = require("@/assets/sounds/message-pop.mp3");
    messageSound = createAudioPlayer(audioSource);
  }
};

export const playMessageSound = async () => {
  try {
    if (!messageSound) await loadMessageSound();
    if (messageSound) {
      // Reset to beginning and play (equivalent to replayAsync)
      messageSound.seekTo(0);
      messageSound.play();
    }
  } catch (error) {
    console.warn("Failed to play message sound:", error);
  }
};
