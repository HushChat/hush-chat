import { useCallback, useEffect, useRef, useState } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";
import { PLATFORM } from "@/constants/platformConstants";
import { getFileType } from "@/utils/files/getFileType";
import { IMessageAttachment } from "@/types/chat/types";

interface ThumbnailCache {
  [index: number]: string;
}

interface UseVideoThumbnailsOptions {
  windowSize?: number;
  quality?: number;
  captureTime?: number;
}

const DEFAULT_OPTIONS: Required<UseVideoThumbnailsOptions> = {
  windowSize: 1,
  quality: 0.7,
  captureTime: 100,
};

const generateWebThumbnail = (videoUrl: string, quality: number): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    const cleanup = () => {
      video.remove();
    };

    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.currentTime = 0.1;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    video.onloadeddata = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(null);
          return;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL("image/jpeg", quality);

        canvas.remove();
        cleanup();
        resolve(thumbnailUrl);
      } catch {
        cleanup();
        resolve(null);
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(null);
    };

    video.load();
  });
};

const generateNativeThumbnail = async (
  videoUrl: string,
  captureTime: number,
  quality: number
): Promise<string | null> => {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
      time: captureTime,
      quality,
    });
    return uri;
  } catch {
    return null;
  }
};

export const useVideoThumbnails = (
  attachments: IMessageAttachment[],
  currentIndex: number,
  options: UseVideoThumbnailsOptions = {}
): ThumbnailCache => {
  const { windowSize, quality, captureTime } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [thumbnails, setThumbnails] = useState<ThumbnailCache>({});
  const pendingGenerations = useRef<Set<number>>(new Set());
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const generateThumbnail = useCallback(
    async (videoUrl: string, index: number) => {
      if (thumbnails[index] || pendingGenerations.current.has(index)) {
        return;
      }

      pendingGenerations.current.add(index);

      const thumbnailUri = PLATFORM.IS_WEB
        ? await generateWebThumbnail(videoUrl, quality)
        : await generateNativeThumbnail(videoUrl, captureTime, quality);

      pendingGenerations.current.delete(index);

      if (thumbnailUri && isMounted.current) {
        setThumbnails((prev) => ({ ...prev, [index]: thumbnailUri }));
      }
    },
    [thumbnails, quality, captureTime]
  );

  useEffect(() => {
    if (!attachments.length) return;

    const startIndex = Math.max(0, currentIndex - windowSize);
    const endIndex = Math.min(attachments.length - 1, currentIndex + windowSize);

    for (let i = startIndex; i <= endIndex; i++) {
      const attachment = attachments[i];
      if (!attachment?.fileUrl) continue;

      const fileName = attachment.originalFileName || attachment.indexedFileName || "";
      const fileType = getFileType(fileName);

      if (fileType === "video") {
        generateThumbnail(attachment.fileUrl, i);
      }
    }
  }, [attachments, currentIndex, windowSize, generateThumbnail]);

  return thumbnails;
};

export default useVideoThumbnails;
