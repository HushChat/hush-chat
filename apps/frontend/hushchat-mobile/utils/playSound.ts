/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
