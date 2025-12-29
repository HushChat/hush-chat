import { useCallback, useEffect, useRef, useState } from "react";
import { ToastUtils } from "@/utils/toastUtils";
import { getDraftKey } from "@/constants/constants";
import { StorageFactory } from "@/utils/storage/storageFactory";
import {
  AudioRecorder,
  RecordingSession,
  useMessageAudioUploader,
} from "@/apis/audio-upload-service/audio-upload-service";
import { LocalFile, UploadResult } from "@/hooks/useNativePickerUpload";
import { IMessage } from "@/types/chat/types";

export type TUseAudioRecordingReturn = {
  isRecording: boolean;
  isRecordUploading: boolean;
  recordingDuration: number;
  formatDuration: (seconds: number) => string;
  handleStartRecording: () => Promise<void>;
  handleStopRecording: () => Promise<void>;
  handleCancelRecording: () => Promise<void>;
};

interface UseAudioRecordingProps {
  conversationId: number;
  message: string;
  replyToMessage: IMessage;
  onCancelReply?: () => void;
  updateConversationMessagesCache: (msg: IMessage) => void;
}

const storage = StorageFactory.createStorage();

export const useAudioRecording = ({
  conversationId,
  message,
  replyToMessage,
  onCancelReply,
  updateConversationMessagesCache,
}: UseAudioRecordingProps): TUseAudioRecordingReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordUploading, setIsRecordUploading] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<RecordingSession | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioUploader = useMessageAudioUploader(
    conversationId,
    message,
    updateConversationMessagesCache
  );

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const clearTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const handleStartRecording = useCallback(async () => {
    try {
      const recording = await AudioRecorder.startRecording();
      if (!recording) {
        ToastUtils.error("Failed to start recording. Please check microphone permissions.");
        return;
      }

      setRecordingInstance(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      ToastUtils.error("Failed to start recording");
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    if (!recordingInstance) return;

    try {
      clearTimer();
      setIsRecording(false);
      setIsRecordUploading(true);

      const result = await AudioRecorder.stopRecording(recordingInstance);
      if (!result) {
        ToastUtils.error("Failed to save recording");

        setRecordingInstance(null);
        setRecordingDuration(0);
        setIsRecordUploading(false);
        return;
      }

      let uploadResults: UploadResult[];

      if (recordingInstance.platform === "web") {
        const blob = result instanceof Blob ? result : null;
        if (!blob) throw new Error("Expected Blob for web recording");

        const extension = blob.type.includes("webm") ? "webm" : "mp4";
        const audioFile = new File([blob], `audio_${Date.now()}.${extension}`, {
          type: blob.type,
        });
        uploadResults = await audioUploader.uploadAudioFile(audioFile);
      } else {
        const uri = result as string;
        const response = await fetch(uri);
        const blob = await response.blob();

        const localFile: LocalFile = {
          uri,
          name: `audio_${Date.now()}.m4a`,
          type: "audio/m4a",
          size: blob.size,
        };
        uploadResults = await audioUploader.uploadAudioLocalFile(localFile);
      }

      const failed = uploadResults.find((r) => !r.success);
      if (failed) {
        ToastUtils.error(failed.error || "Failed to upload audio");

        setRecordingInstance(null);
        setRecordingDuration(0);
        setIsRecordUploading(false);
        return;
      }

      setRecordingInstance(null);
      setRecordingDuration(0);
      setIsRecordUploading(false);

      if (replyToMessage) {
        onCancelReply?.();
      }

      await storage.remove(getDraftKey(conversationId));
    } catch (error) {
      console.error("Failed to stop recording:", error);
      ToastUtils.error("Failed to upload audio");
      setIsRecordUploading(false);
    }
  }, [
    recordingInstance,
    audioUploader,
    replyToMessage,
    onCancelReply,
    conversationId,
    storage,
    clearTimer,
  ]);

  const handleCancelRecording = useCallback(async () => {
    if (!recordingInstance) return;

    try {
      clearTimer();

      if (recordingInstance.platform === "web") {
        recordingInstance.mediaRecorder.stop();
        recordingInstance.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } else {
        await recordingInstance.recording.stopAndUnloadAsync();
      }

      setIsRecording(false);
      setRecordingInstance(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to cancel recording:", error);
    }
  }, [recordingInstance, clearTimer]);

  return {
    isRecording,
    isRecordUploading,
    recordingDuration,
    formatDuration,
    handleStartRecording,
    handleStopRecording,
    handleCancelRecording,
  };
};
