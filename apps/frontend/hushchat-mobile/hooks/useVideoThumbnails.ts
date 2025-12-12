import { PLATFORM } from "@/constants/platformConstants";
import { getFileType } from "@/utils/files/getFileType";
import { useEffect, useState } from "react";
import * as VideoThumbnails from "expo-video-thumbnails";
import { IMessageAttachment } from "@/types/chat/types";

export const useVideoThumbnails = (images: IMessageAttachment[]) => {
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});

  useEffect(() => {
    images.forEach((image, index) => {
      const fileType = getFileType(image?.originalFileName || image?.indexedFileName || "");
      if (fileType === "video" && image?.fileUrl) {
        generateThumbnail(image.fileUrl, index);
      }
    });
  }, [images]);

  const generateThumbnail = async (videoUrl: string, index: number) => {
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
          } catch (err) {
            console.error("Canvas error:", err);
            video.remove();
          }
        };

        video.onerror = (err) => {
          console.error("Video load error:", err);
          video.remove();
        };

        video.load();
      } else {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
          time: 100,
          quality: 0.7,
        });
        setThumbnails((prev) => ({ ...prev, [index]: uri }));
      }
    } catch (error) {
      console.error("Error generating video thumbnail:", error);
    }
  };

  return thumbnails;
};
