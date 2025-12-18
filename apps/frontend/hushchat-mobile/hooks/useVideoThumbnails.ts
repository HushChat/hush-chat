import { PLATFORM } from "@/constants/platformConstants";
import { getFileType } from "@/utils/files/getFileType";
import { useCallback, useEffect, useRef, useState } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";
import { IMessageAttachment } from "@/types/chat/types";

export const useVideoThumbnails = (
  images: IMessageAttachment[],
  currentIndex: number,
  windowSize: number = 1
) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const generatingRef = useRef<Set<number>>(new Set());

  const generateThumbnail = useCallback(
    async (videoUrl: string, index: number) => {
      if (thumbnails[index] || generatingRef.current.has(index)) return;

      generatingRef.current.add(index);

      try {
        if (PLATFORM.IS_WEB) {
          if (typeof document === "undefined") return;

          const video = document.createElement("video");
          video.crossOrigin = "anonymous";
          video.src = videoUrl;
          video.currentTime = 0.1;
          video.muted = true;
          video.playsInline = true;

          video.onloadeddata = () => {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth || 640;
              canvas.height = video.videoHeight || 480;

              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
                setThumbnails((prev) => ({ ...prev, [index]: thumbnailUrl }));
              }

              video.remove();
              canvas.remove();
            } catch {
              video.remove();
            } finally {
              generatingRef.current.delete(index);
            }
          };

          video.onerror = () => {
            video.remove();
            generatingRef.current.delete(index);
          };

          video.load();
        } else {
          const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
            time: 100,
            quality: 0.7,
          });

          setThumbnails((prev) => ({ ...prev, [index]: uri }));
          generatingRef.current.delete(index);
        }
      } catch {
        generatingRef.current.delete(index);
      }
    },
    [thumbnails]
  );

  useEffect(() => {
    if (!images.length) return;

    const start = Math.max(0, currentIndex - windowSize);
    const end = Math.min(images.length - 1, currentIndex + windowSize);

    for (let i = start; i <= end; i++) {
      const img = images[i];
      const fileType = getFileType(img?.originalFileName || img?.indexedFileName || "");

      if (fileType === "video" && img?.fileUrl) {
        generateThumbnail(img.fileUrl, i);
      }
    }
  }, [images, currentIndex, windowSize, generateThumbnail]);

  return thumbnails;
};
