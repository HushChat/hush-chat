import { Audio } from "expo-av";
import {
  LocalFile,
  SignedUrl,
  UploadResult,
  useNativePickerUpload,
} from "@/hooks/useNativePickerUpload";
import { logWarn } from "@/utils/logger";
import { createMessagesWithAttachments, publishMessageEvents } from "@/apis/conversation";
import {
  IMessageWithSignedUrl,
  TAttachmentUploadRequest,
} from "@/apis/photo-upload-service/photo-upload-service";
import { useConversationMessagesQuery } from "@/query/useConversationMessageQuery";
import { PLATFORM } from "@/constants/platformConstants";

const MAX_AUDIO_MB = 10;
const BYTES_PER_MB = 1024 * 1024;
const MAX_AUDIO_BYTES = MAX_AUDIO_MB * BYTES_PER_MB;

/**
 * Configuration for native audio recording (iOS and Android)
 */
const NATIVE_RECORDING_OPTIONS: Audio.RecordingOptions = {
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

type WebRecordingSession = {
  platform: "web";
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
};

type NativeRecordingSession = {
  platform: "native";
  recording: Audio.Recording;
};

export type RecordingSession = WebRecordingSession | NativeRecordingSession;

type WebDurationInput = {
  platform: "web";
  blob: Blob;
};

type NativeDurationInput = {
  platform: "native";
  recording: Audio.Recording;
};

type DurationInput = WebDurationInput | NativeDurationInput;

type ValidationResult = { isValid: true } | { isValid: false; error: string };

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
 * Checks if a media stream has active audio tracks
 * @param stream - The MediaStream to check
 * @returns boolean
 */
export const isAudioPermissionGrantedWeb = (stream: MediaStream | null): boolean => {
  return !!stream && stream.getAudioTracks().some((track) => track.enabled);
};

/**
 * Starts audio recording on web platform using MediaRecorder API
 * Prioritizes audio/mp4 (m4a) for better cross-platform compatibility
 * @returns Object containing MediaRecorder and audio chunks array
 */
export const startAudioRecordingWeb = async (): Promise<{
  mediaRecorder: MediaRecorder;
  audioChunks: Blob[];
} | null> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const hasPermission = await isAudioPermissionGrantedWeb(stream);
    if (!hasPermission) {
      throw new Error("Microphone permission required");
    }

    // Prioritize audio/mp4 (m4a) for better iOS/cross-platform compatibility
    let mimeType = "audio/webm"; // fallback

    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    } else if (MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")) {
      // AAC codec - widely supported
      mimeType = "audio/mp4;codecs=mp4a.40.2";
    } else if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      mimeType = "audio/webm;codecs=opus";
    } else if (MediaRecorder.isTypeSupported("audio/webm")) {
      mimeType = "audio/webm";
    }

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
 * Validates audio file existence and size
 */
const getAudioValidationResult = (size: number | undefined): ValidationResult => {
  if (size === undefined || size === null) {
    return { isValid: false, error: "Could not determine audio file size" };
  }
  if (size === 0) {
    return { isValid: false, error: "Audio file is empty" };
  }
  if (size > MAX_AUDIO_BYTES) {
    return { isValid: false, error: `Audio file too large (> ${MAX_AUDIO_MB} MB)` };
  }
  return { isValid: true };
};

const extractSignedUrls = (response: IMessageWithSignedUrl[] | any): SignedUrl[] => {
  if (Array.isArray(response)) {
    return response
      .filter((item) => item.signedUrl && item.signedUrl.url)
      .map((item) => ({
        originalFileName: item.signedUrl.originalFileName,
        url: item.signedUrl.url,
        indexedFileName: item.signedUrl.indexedFileName,
        messageId: item.id,
      }));
  }
  return [];
};

type UploadCompletionCallback = (results: UploadResult[]) => void | Promise<void>;

/**
 * Hook for uploading audio recordings to S3 via signed URLs
 * @param conversationId - The conversation ID to upload audio to
 * @param onUploadComplete - function to run upload completion for send attachment to other users
 */
export function useMessageAudioUploader(
  conversationId: number,
  onUploadComplete?: UploadCompletionCallback
) {
  const handleUploadSuccess = async (messageIds: number[]) => {
    await publishMessageEvents(conversationId, messageIds);
  };
  const { updateConversationMessagesCache, updateConversationsListCache } =
    useConversationMessagesQuery(conversationId, { enabled: false });

  const getSignedUrls = async (
    files: LocalFile[],
    messageText: string = "",
    parentMessageId?: number | null
  ): Promise<SignedUrl[] | null> => {
    const attachments: TAttachmentUploadRequest[] = files.map((file) => ({
      messageText,
      fileName: file.name,
      parentMessageId,
    }));

    const messagesWithSignedUrl = await createMessagesWithAttachments(conversationId, attachments);
    const tempMessage = {
      ...messagesWithSignedUrl[0],
      hasAttachment: true,
      messageAttachments: [
        {
          fileUrl: files[0]?.uri,
          type: "AUDIO",
        },
      ],
    };
    updateConversationMessagesCache(tempMessage);
    updateConversationsListCache(tempMessage);

    return extractSignedUrls(messagesWithSignedUrl);
  };

  const hook = useNativePickerUpload(getSignedUrls, handleUploadSuccess);

  /**
   * Uploads a File object (web platform)
   * @param file - The File object from web recording
   * @returns Upload results array
   */
  const uploadAudioFileFromWeb = async (file: File): Promise<UploadResult[]> => {
    const validation = getAudioValidationResult(file.size);
    if (!validation.isValid) {
      return [{ success: false, fileName: file.name, error: validation.error }];
    }

    const localFile: LocalFile = {
      uri: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size,
    };

    try {
      const results = await hook.upload([localFile], "");

      if (results && onUploadComplete) {
        await onUploadComplete(results);
      }

      return results || [];
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
  const uploadAudioLocalFileMobile = async (localFile: LocalFile): Promise<UploadResult[]> => {
    const validation = getAudioValidationResult(localFile.size);
    if (!validation.isValid) {
      return [{ success: false, fileName: localFile.name, error: validation.error }];
    }

    try {
      const response = await hook.upload([localFile], "");

      if (response && onUploadComplete) {
        await onUploadComplete(response);
      }

      return response || [];
    } catch (error) {
      logWarn("Failed to upload native audio file:", error);
      throw error;
    }
  };

  return {
    ...hook,
    uploadAudioFileFromWeb,
    uploadAudioLocalFileMobile,
  };
}

export const AudioRecorder = {
  /**
   * Starts audio recording based on current platform
   * @returns Recording instance (Audio.Recording for native, MediaRecorder data for web)
   */
  startRecording: async (): Promise<RecordingSession | null> => {
    if (PLATFORM.IS_WEB) {
      const result = await startAudioRecordingWeb();
      if (!result) return null;
      return {
        platform: "web",
        mediaRecorder: result.mediaRecorder,
        audioChunks: result.audioChunks,
      };
    } else {
      const recording = await startAudioRecordingNative();
      if (!recording) return null;
      return {
        platform: "native",
        recording,
      };
    }
  },

  /**
   * Stops audio recording based on current platform
   * @param session - Recording instance from startRecording
   * @returns File URI (native) or Blob (web)
   */
  stopRecording: async (session: RecordingSession): Promise<string | Blob | null> => {
    if (session.platform === "web") {
      return await stopAudioRecordingWeb(session.mediaRecorder, session.audioChunks);
    }
    return await stopAudioRecordingNative(session.recording);
  },
  /**
   * Gets recording duration based on current platform
   * @param input - Recording instance or Blob
   * @returns Duration in seconds
   */
  getDuration: async (input: DurationInput) => {
    if (input.platform === "web") {
      return await getAudioDurationWeb(input.blob);
    } else {
      return await getAudioDurationNative(input.recording);
    }
  },
};
