import { Audio } from "expo-av";
import { Platform } from "react-native";
import {
  LocalFile,
  SignedUrl,
  UploadResult,
  useNativePickerUpload,
} from "@/hooks/useNativePickerUpload";
import { sendMessageByConversationIdFiles } from "@/apis/conversation";
import { logWarn } from "@/utils/logger";
import { type IMessage, MessageTypeEnum } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";

const MAX_AUDIO_KB = 1024 * 10; // 10 MB

const ALLOWED_AUDIO_TYPES = [
  "audio/m4a",
  "audio/mp4",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/webm",
  "audio/aac",
];

/**
 * Configuration for native audio recording (iOS and Android)
 */
const NATIVE_RECORDING_OPTIONS = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

/**
 * Requests microphone permission for native platforms
 * @returns Permission status
 */
export const requestAudioPermissionNative = async (): Promise<boolean> => {
  try {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  } catch (error) {
    logWarn("Failed to request audio permission:", error);
    return false;
  }
};

/**
 * Starts audio recording on native platforms (iOS/Android)
 * @returns Audio.Recording instance or null if failed
 */
export const startAudioRecordingNative = async (): Promise<Audio.Recording | null> => {
  try {
    const hasPermission = await requestAudioPermissionNative();
    if (!hasPermission) {
      throw new Error("Microphone permission required");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(NATIVE_RECORDING_OPTIONS);
    return recording;
  } catch (error) {
    logWarn("Failed to start native audio recording:", error);
    return null;
  }
};

/**
 * Stops audio recording on native platforms and returns the file URI
 * @param recording - The Audio.Recording instance to stop
 * @returns Local file URI or null if failed
 */
export const stopAudioRecordingNative = async (
  recording: Audio.Recording
): Promise<string | null> => {
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    return uri;
  } catch (error) {
    logWarn("Failed to stop native audio recording:", error);
    return null;
  }
};

/**
 * Gets the duration of an audio recording in seconds
 * @param recording - The Audio.Recording instance
 * @returns Duration in seconds or 0 if failed
 */
export const getAudioDurationNative = async (recording: Audio.Recording): Promise<number> => {
  try {
    const status = await recording.getStatusAsync();
    if (status.isRecording || !status.durationMillis) {
      return 0;
    }
    return Math.floor(status.durationMillis / 1000);
  } catch (error) {
    logWarn("Failed to get audio duration:", error);
    return 0;
  }
};

/**
 * Requests microphone permission for web platform
 * @returns Permission status
 */
export const requestAudioPermissionWeb = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop the stream immediately, we only needed it for permission
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    logWarn("Failed to request web audio permission:", error);
    return false;
  }
};

/**
 * Starts audio recording on web platform using MediaRecorder API
 * @returns Object containing MediaRecorder and audio chunks array
 */
export const startAudioRecordingWeb = async (): Promise<{
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
} | null> => {
  try {
    const hasPermission = await requestAudioPermissionWeb();
    if (!hasPermission) {
      throw new Error("Microphone permission required");
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const audioChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.start();
    return { mediaRecorder, audioChunks };
  } catch (error) {
    logWarn("Failed to start web audio recording:", error);
    return null;
  }
};

/**
 * Stops audio recording on web platform and returns the audio blob
 * @param mediaRecorder - The MediaRecorder instance to stop
 * @param audioChunks - Array of audio data chunks
 * @returns Audio blob or null if failed
 */
export const stopAudioRecordingWeb = async (
  mediaRecorder: MediaRecorder,
  audioChunks: Blob[]
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    try {
      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunks, { type: mimeType });

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        resolve(audioBlob);
      };

      mediaRecorder.stop();
    } catch (error) {
      logWarn("Failed to stop web audio recording:", error);
      resolve(null);
    }
  });
};

/**
 * Gets the duration of a web audio blob in seconds
 * @param blob - The audio blob
 * @returns Duration in seconds or 0 if failed
 */
export const getAudioDurationWeb = async (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = new window.Audio();
      const url = URL.createObjectURL(blob);

      audio.addEventListener("loadedmetadata", () => {
        URL.revokeObjectURL(url);
        resolve(Math.floor(audio.duration));
      });

      audio.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        resolve(0);
      });

      audio.src = url;
    } catch (error) {
      logWarn("Failed to get web audio duration:", error);
      resolve(0);
    }
  });
};

/**
 * Validates audio file size
 * @param sizeInBytes - File size in bytes
 * @returns True if valid, false otherwise
 */
const validateAudioSize = (sizeInBytes: number): boolean => {
  const sizeInKB = sizeInBytes / 1024;
  return sizeInKB <= MAX_AUDIO_KB;
};

/**
 * Hook for uploading audio recordings to S3 via signed URLs
 * @param conversationId - The conversation ID to upload audio to
 * @param messageToSend - The message text to send with the audio
 * @param updateConversationMessagesCache
 */
export function useMessageAudioUploader(
  conversationId: number,
  messageToSend: string,
  updateConversationMessagesCache: (msg: IMessage) => void
) {
  const {
    user: { id: currentUserId },
  } = useUserStore();

  /**
   * Fetches signed URLs from the backend for audio upload
   * @param files - Array of local files to get signed URLs for
   * @param type
   * @returns Array of signed URLs or null if failed
   */
  const getSignedUrls = async (
    files: LocalFile[],
    type?: MessageTypeEnum
  ): Promise<SignedUrl[] | null> => {
    const fileNames = files.map((file) => file.name);
    const response = await sendMessageByConversationIdFiles(
      conversationId,
      messageToSend,
      fileNames,
      type
    );
    const signed = response?.signedURLs || [];
    return signed.map((s: { originalFileName: string; url: string; indexedFileName: string }) => ({
      originalFileName: s.originalFileName,
      url: s.url,
      indexedFileName: s.indexedFileName,
    }));
  };

  const hook = useNativePickerUpload(getSignedUrls);

  /**
   * Updates the message list with optimistic audio message
   * @param files - Array of File or LocalFile objects
   */
  const updateMessageList = (files: (File | LocalFile)[]) => {
    const tempMessage: IMessage = {
      senderId: Number(currentUserId),
      senderFirstName: "",
      senderLastName: "",
      messageText: messageToSend,
      createdAt: new Date().toISOString(),
      conversationId: conversationId,
      messageType: MessageTypeEnum.AUDIO,
      messageAttachments: files.map((file) => ({
        fileUrl: file instanceof File ? URL.createObjectURL(file) : file.uri,
        originalFileName: file.name,
        indexedFileName: "",
        mimeType: file.type,
      })),
    };

    // Local optimistic update
    updateConversationMessagesCache(tempMessage);
  };

  /**
   * Uploads a File object (web platform)
   * @param file - The File object from web recording
   * @returns Upload results array
   */
  const uploadAudioFile = async (file: File): Promise<UploadResult[]> => {
    if (!validateAudioSize(file.size)) {
      return [
        {
          success: false,
          fileName: file.name,
          error: `Audio file too large (> ${MAX_AUDIO_KB / 1024} MB)`,
        },
      ];
    }

    const localFile: LocalFile = {
      uri: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    };

    try {
      // Optimistic update
      updateMessageList([file]);

      const results = await hook.upload([localFile], MessageTypeEnum.AUDIO);
      URL.revokeObjectURL(localFile.uri);

      return results;
    } catch (error) {
      URL.revokeObjectURL(localFile.uri);
      logWarn("Failed to upload audio file:", error);
      throw error;
    }
  };

  /**
   * Uploads a LocalFile object (native platform)
   * @param localFile - The LocalFile object from native recording
   * @returns Upload results array
   */
  const uploadAudioLocalFile = async (localFile: LocalFile): Promise<UploadResult[]> => {
    if (!validateAudioSize(localFile.size)) {
      return [
        {
          success: false,
          fileName: localFile.name,
          error: `Audio file too large (> ${MAX_AUDIO_KB / 1024} MB)`,
        },
      ];
    }

    try {
      // Optimistic update
      updateMessageList([localFile]);

      return await hook.upload([localFile], MessageTypeEnum.AUDIO);
    } catch (error) {
      logWarn("Failed to upload native audio file:", error);
      throw error;
    }
  };

  return {
    ...hook,
    uploadAudioFile,
    uploadAudioLocalFile,
  };
}

// Export platform-agnostic recording functions
export const AudioRecorder = {
  /**
   * Starts audio recording based on current platform
   * @returns Recording instance (Audio.Recording for native, MediaRecorder data for web)
   */
  startRecording: async () => {
    if (Platform.OS === "web") {
      return await startAudioRecordingWeb();
    } else {
      return await startAudioRecordingNative();
    }
  },

  /**
   * Stops audio recording based on current platform
   * @param recording - Recording instance from startRecording
   * @returns File URI (native) or Blob (web)
   */
  stopRecording: async (recording: any) => {
    if (Platform.OS === "web") {
      return await stopAudioRecordingWeb(recording.mediaRecorder, recording.audioChunks);
    } else {
      return await stopAudioRecordingNative(recording);
    }
  },

  /**
   * Gets recording duration based on current platform
   * @param recordingOrBlob - Recording instance or Blob
   * @returns Duration in seconds
   */
  getDuration: async (recordingOrBlob: any) => {
    if (Platform.OS === "web") {
      return await getAudioDurationWeb(recordingOrBlob);
    } else {
      return await getAudioDurationNative(recordingOrBlob);
    }
  },
};
