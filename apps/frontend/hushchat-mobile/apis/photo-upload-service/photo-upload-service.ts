import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import { CONVERSATION_API_ENDPOINTS, USER_API_ENDPOINTS } from "@/constants/apiConstants";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import { ToastUtils } from "@/utils/toastUtils";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import { LocalFile, UploadResult, useNativePickerUpload } from "@/hooks/useNativePickerUpload";
import { createMessagesWithAttachments } from "@/apis/conversation";
import { useState } from "react";
import { validateFiles } from "@/utils/fileValidation";

export enum UploadType {
  PROFILE = "profile",
  GROUP = "group",
}

const MAX_IMAGE_KB = 1024 * 5; // 5 MB
const MAX_DOCUMENT_KB = 1024 * 10; // 10 MB
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/octet-stream",
  "*/*",
];

export const pickAndUploadImage = async (
  id: string,
  fetchData: () => void,
  setUploading: (v: boolean) => void,
  uploadType: UploadType
) => {
  const getSignedUrlAndInfo = async (fileName: string, fileType: string) => {
    const { data, error } = await getImageSignedUrl(id, fileName, fileType, uploadType);
    if (error) throw new Error(error);
    return data;
  };

  try {
    const pickerResult = await uploadImage();
    if (!pickerResult) {
      return;
    }

    // Check file size is below 5mb
    const asset =
      pickerResult.assets && pickerResult.assets.length > 0 ? pickerResult.assets[0] : null;
    if (!asset) return;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const fileSizeInKB = blob.size / 1024;

    if (fileSizeInKB > MAX_IMAGE_KB) {
      ToastUtils.error("Select an image size below 5MB");
      return;
    }

    const imageAssetData = getImagePickerAsset(pickerResult, uploadType);
    if (!imageAssetData) return;

    const { fileUri, fileName, fileType } = imageAssetData;

    const uploadInfo = await getSignedUrlAndInfo(fileName, fileType);
    const { url: signedUrl, indexedFileName, originalFileName } = uploadInfo;
    const uploadedImageUrl = signedUrl;

    await uploadImageToSignedUrl(fileUri, signedUrl);

    fetchData();

    return { uploadedImageUrl, indexedFileName, originalFileName, pickerResult };
  } catch {
    return;
  } finally {
    setUploading(false);
  }
};

export const uploadImageToSignedUrl = async (fileUri: string, signedUrl: string) => {
  const blob = await (await fetch(fileUri)).blob();
  await fetch(signedUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": blob.type,
    },
  });
};

export const getImageSignedUrl = async (
  id: string,
  fileName: string,
  fileType: string,
  uploadType: UploadType
) => {
  try {
    const endpoint =
      uploadType === UploadType.GROUP
        ? CONVERSATION_API_ENDPOINTS.GROUP_IMAGE_SIGNED_URL(id)
        : USER_API_ENDPOINTS.PROFILE_IMAGE_SIGNED_URL(id);
    const response = await axios.post(endpoint, {
      fileNames: [fileName],
      fileType,
    });
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError.response?.data?.error || axiosError.message };
  }
};

export const uploadImage = async (): Promise<ImagePickerResult | undefined> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access media library is required!");
    return;
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  return pickerResult;
};

export const getImagePickerAsset = (pickerResult: ImagePickerResult, uploadType: UploadType) => {
  const asset =
    pickerResult?.assets && pickerResult?.assets.length > 0 ? pickerResult.assets[0] : null;
  if (!asset) {
    return;
  }

  const defaultFileName = uploadType === UploadType.GROUP ? "group.jpg" : "profile.jpg";
  const fileUri = asset.uri;
  const fileName = fileUri ? fileUri.split("/").pop() || defaultFileName : defaultFileName;
  const fileType = asset.type || "image";

  return { fileUri, fileName, fileType };
};

export type FileWithMessage = {
  file: LocalFile;
  messageText: string;
  parentMessageId?: number;
};

export function useMessageAttachmentUploader(conversationId: number) {
  const [state, setState] = useState({
    isUploading: false,
    error: null as string | null,
    progress: 0,
  });

  const uploadFiles = async (filesWithMessages: FileWithMessage[]): Promise<UploadResult[]> => {
    if (!filesWithMessages.length) return [];

    setState({ isUploading: true, error: null, progress: 0 });

    try {
      const attachmentRequests = filesWithMessages.map((item) => ({
        messageText: item.messageText,
        fileName: item.file.name,
        parentMessageId: item.parentMessageId ?? null,
      }));

      const responses = await createMessagesWithAttachments(conversationId, attachmentRequests);

      const results: UploadResult[] = [];

      for (let i = 0; i < filesWithMessages.length; i++) {
        const { file } = filesWithMessages[i];
        const response = responses[i];

        try {
          const signedUrl = response?.signedUrl?.url;
          if (!signedUrl) {
            throw new Error("No signed URL returned");
          }

          const blob = await (await fetch(file.uri)).blob();
          await fetch(signedUrl, {
            method: "PUT",
            body: blob,
            headers: { "Content-Type": file.type },
          });

          results.push({
            success: true,
            fileName: file.name,
            signed: {
              originalFileName: file.name,
              url: signedUrl,
              indexedFileName: response.signedUrl?.indexedFileName,
            },
          });
        } catch (error: any) {
          results.push({
            success: false,
            fileName: file.name,
            error: error?.message ?? "Upload failed",
          });
        }

        setState((s) => ({ ...s, progress: (i + 1) / filesWithMessages.length }));
      }

      return results;
    } catch (error: any) {
      setState((s) => ({ ...s, error: error?.message }));
      return filesWithMessages.map((item) => ({
        success: false,
        fileName: item.file.name,
        error: error?.message ?? "Upload failed",
      }));
    } finally {
      setState((s) => ({ ...s, isUploading: false }));
    }
  };

  const pickerHook = useNativePickerUpload(async () => null);

  // Pass messageText and parentMessageId at call time
  const pickAndUploadImages = async (messageText: string = "", parentMessageId?: number) => {
    const files = await pickerHook.pick({
      source: "media",
      mediaKind: "image",
      multiple: true,
      maxSizeKB: MAX_IMAGE_KB,
      allowedMimeTypes: ["image/*"],
    });
    if (!files) return [];

    const filesWithMessages: FileWithMessage[] = files.map((file, index) => ({
      file,
      messageText: index === 0 ? messageText : "",
      parentMessageId,
    }));

    return uploadFiles(filesWithMessages);
  };

  const pickAndUploadDocuments = async (messageText: string = "", parentMessageId?: number) => {
    const files = await pickerHook.pick({
      source: "document",
      multiple: true,
      maxSizeKB: MAX_DOCUMENT_KB,
      allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
    });
    if (!files) return [];

    const filesWithMessages: FileWithMessage[] = files.map((file, index) => ({
      file,
      messageText: index === 0 ? messageText : "",
      parentMessageId,
    }));

    return uploadFiles(filesWithMessages);
  };

  const uploadFilesFromWeb = async (
    files: File[],
    messageText: string = "",
    parentMessageId?: number
  ): Promise<UploadResult[]> => {
    const validFiles = validateFiles(files);

    const localFiles: LocalFile[] = validFiles.validFiles.map((f) => ({
      uri: URL.createObjectURL(f),
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
    }));

    const filesWithMessages: FileWithMessage[] = localFiles.map((file, index) => ({
      file,
      messageText: index === 0 ? messageText : "",
      parentMessageId,
    }));

    try {
      return await uploadFiles(filesWithMessages);
    } finally {
      localFiles.forEach((f) => URL.revokeObjectURL(f.uri));
    }
  };

  return {
    ...state,
    pickAndUploadImages,
    pickAndUploadDocuments,
    uploadFilesFromWeb,
  };
}
