import { useCallback, useRef, useState } from "react";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { MAX_VOICE_MESSAGE_DURATION_MS } from "@/constants/mediaConstants";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { PLATFORM } from "@/constants/platformConstants";
import { ToastUtils } from "@/utils/toastUtils";
import { logError } from "@/utils/logger";

interface UseVoiceRecorderReturn {
  state: {
    isRecording: boolean;
    isPreparing: boolean;
    durationMs: number;
    error: string | null;
  };
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<LocalFile | null>;
  cancelRecording: () => void;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCancelledRef = useRef(false);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);

  const clearAutoStopTimer = useCallback(() => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    isCancelledRef.current = false;

    try {
      setIsPreparing(true);

      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        ToastUtils.error("Microphone permission is required to record voice messages");
        setIsPreparing(false);
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsPreparing(false);

      autoStopTimerRef.current = setTimeout(async () => {
        if (recorder.isRecording) {
          await recorder.stop();
        }
      }, MAX_VOICE_MESSAGE_DURATION_MS);
    } catch (err: any) {
      setIsPreparing(false);
      const msg = err?.message ?? "Failed to start recording";
      setError(msg);
      logError("Voice recording failed to start:", err);
      ToastUtils.error(msg);
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<LocalFile | null> => {
    clearAutoStopTimer();

    if (isCancelledRef.current) {
      return null;
    }

    try {
      if (recorder.isRecording) {
        await recorder.stop();
      }

      const uri = recorder.uri;
      if (!uri) {
        return null;
      }

      const isWeb = PLATFORM.IS_WEB;
      const ext = isWeb ? "webm" : "m4a";
      const mimeType = isWeb ? "audio/webm" : "audio/m4a";
      const timestamp = Date.now();
      const name = `voice-message-${timestamp}.${ext}`;

      const file: LocalFile = {
        uri,
        name,
        type: mimeType,
      };

      return file;
    } catch (err: any) {
      const msg = err?.message ?? "Failed to stop recording";
      setError(msg);
      logError("Voice recording failed to stop:", err);
      return null;
    }
  }, [recorder, clearAutoStopTimer]);

  const cancelRecording = useCallback(() => {
    clearAutoStopTimer();
    isCancelledRef.current = true;

    try {
      if (recorder.isRecording) {
        recorder.stop();
      }
    } catch {
      // Ignore errors on cancel
    }
  }, [recorder, clearAutoStopTimer]);

  return {
    state: {
      isRecording: recorderState.isRecording,
      isPreparing,
      durationMs: recorderState.durationMillis,
      error,
    },
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
