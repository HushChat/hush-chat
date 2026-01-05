import { useCallback, useState } from "react";
import * as MediaLibrary from "expo-media-library";
import { ToastUtils } from "@/utils/toastUtils";
import { IMessageAttachment } from "@/types/chat/types";
import { Directory, File, Paths } from "expo-file-system";

interface IConfirmDialogState {
  visible: boolean;
  existingFileUri: string | null;
}

export const useMediaDownload = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [dialogState, setDialogState] = useState<IConfirmDialogState>({
    visible: false,
    existingFileUri: null,
  });

  const saveToGallery = useCallback(async (uri: string): Promise<boolean> => {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      ToastUtils.success("Saved to Gallery");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Download failed. Please try again.";
      ToastUtils.error(message);
      return false;
    }
  }, []);

  const downloadMedia = useCallback(
    async (attachment: IMessageAttachment | undefined) => {
      if (!attachment?.fileUrl || !attachment?.originalFileName) return;

      setIsDownloading(true);

      try {
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== "granted") {
          ToastUtils.error("Permission Required", "Please allow access to your photos.");
          setIsDownloading(false);
          return;
        }

        const cacheDir = new Directory(Paths.cache, "downloads");
        if (!cacheDir.exists) {
          cacheDir.create();
        }

        const destinationFile = new File(cacheDir, attachment.originalFileName);

        if (destinationFile.exists) {
          setIsDownloading(false);
          setDialogState({
            visible: true,
            existingFileUri: destinationFile.uri,
          });
          return;
        }

        await File.downloadFileAsync(attachment.fileUrl, destinationFile);
        await saveToGallery(destinationFile.uri);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Download failed.";
        ToastUtils.error(message);
      } finally {
        setIsDownloading(false);
      }
    },
    [saveToGallery]
  );

  const handleConfirmSave = useCallback(async () => {
    if (dialogState.existingFileUri) {
      setIsDownloading(true);
      await saveToGallery(dialogState.existingFileUri);
      setIsDownloading(false);
    }
    setDialogState({ visible: false, existingFileUri: null });
  }, [dialogState.existingFileUri, saveToGallery]);

  const handleCancelDialog = useCallback(() => {
    setDialogState({ visible: false, existingFileUri: null });
  }, []);

  return {
    isDownloading,
    dialogState,
    downloadMedia,
    handleConfirmSave,
    handleCancelDialog,
  };
};
