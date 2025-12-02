import { useCallback, useEffect, useRef, useState } from "react";
import { ToastUtils } from "@/utils/toastUtils";
import { getDraftKey } from "@/constants/constants";
import { StorageFactory } from "@/utils/storage/storageFactory";
import { PLATFORM } from "@/constants/platformConstants";
import {
  AudioRecorder,
  stopAudioRecordingWeb,
  stopAudioRecordingNative,
  useMessageAudioUploader,
} from "@/apis/audio-upload-service/audio-upload-service";
import { LocalFile, UploadResult } from "@/hooks/useNativePickerUpload";

interface UseAudioRecordingProps {
  conversationId: number;
  message: string;
  replyToMessage: any;
  onCancelReply?: () => void;
  updateConversationMessagesCache: (msg: any) => void;
}

export const useAudioRecording = ({
  conversationId,
  message,
  replyToMessage,
  onCancelReply,
  updateConversationMessagesCache,
}: UseAudioRecordingProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordUploading, setIsRecordUploading] = useState(false);
  const [recordingInstance, setRecordingInstance] = useState<any>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const storage = StorageFactory.createStorage();

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

      let uploadResults: UploadResult[];

      if (PLATFORM.IS_WEB) {
        const blob = await stopAudioRecordingWeb(
          recordingInstance.mediaRecorder,
          recordingInstance.audioChunks
        );

        if (!blob) {
          ToastUtils.error("Failed to save recording");
          setIsRecordUploading(false);
          return;
        }

        const extension = blob.type.includes("webm") ? "webm" : "mp4";
        const audioFile = new File([blob], `audio_${Date.now()}.${extension}`, {
          type: blob.type,
        });

        uploadResults = await audioUploader.uploadAudioFile(audioFile);
      } else {
        const uri = await stopAudioRecordingNative(recordingInstance);

        if (!uri) {
          ToastUtils.error("Failed to save recording");
          setIsRecordUploading(false);
          return;
        }

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

      if (PLATFORM.IS_WEB) {
        recordingInstance.mediaRecorder.stop();
        recordingInstance.mediaRecorder.stream.getTracks().forEach((track: any) => track.stop());
      } else {
        await recordingInstance.stopAndUnloadAsync();
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
