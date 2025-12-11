import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import { CONVERSATION_API_ENDPOINTS, USER_API_ENDPOINTS } from "@/constants/apiConstants";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import { ToastUtils } from "@/utils/toastUtils";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import {
  LocalFile,
  SignedUrl,
  UploadResult,
  useNativePickerUpload,
} from "@/hooks/useNativePickerUpload";
import { sendMessageByConversationIdFiles } from "@/apis/conversation";
import { logWarn } from "@/utils/logger";

export enum UploadType {
  PROFILE = "profile",
  GROUP = "group",
}

export const MAX_IMAGE_KB = 1024 * 5; // 5 MB
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

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

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

export function useMessageAttachmentUploader(conversationId: number, messageToSend: string) {
  const getSignedUrls = async (files: LocalFile[]): Promise<SignedUrl[] | null> => {
    const fileNames = files.map((file) => file.name);
    const response = await sendMessageByConversationIdFiles(
      conversationId,
      messageToSend,
      fileNames
    );
    const signed = response?.signedURLs || [];
    return signed.map((s: { originalFileName: string; url: string; indexedFileName: string }) => ({
      originalFileName: s.originalFileName,
      url: s.url,
      indexedFileName: s.indexedFileName,
    }));
  };

  const hook = useNativePickerUpload(getSignedUrls);

  const pickAndUploadImages = async () =>
    hook.pickAndUpload({
      source: "media",
      mediaKind: "image",
      multiple: true,
      maxSizeKB: MAX_IMAGE_KB,
      allowedMimeTypes: ["image/*"],
      allowsEditing: false,
    });

  const pickAndUploadDocuments = async () =>
    hook.pickAndUpload({
      source: "document",
      multiple: true,
      maxSizeKB: MAX_DOCUMENT_KB,
      allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
    });

  const uploadFilesFromWeb = async (files: File[]): Promise<UploadResult[]> => {
    if (!files || files.length === 0) return [];

    const toLocal = (f: File): LocalFile & { _blobUrl: string } => ({
      uri: URL.createObjectURL(f),
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
      _blobUrl: "",
    });

    const locals: (LocalFile & { _blobUrl: string })[] = [];
    const skipped: UploadResult[] = [];

    for (const file of files) {
      const fileType = file.type || "";
      const isImage = ALLOWED_IMAGE_TYPES.some(
        (type) => fileType === type || fileType.startsWith("image/")
      );
      const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileType);

      if (!isImage && !isDocument) {
        skipped.push({
          success: false,
          fileName: file.name,
          error: `Unsupported file type: ${fileType || "unknown"}`,
        });
        continue;
      }

      const maxSize = isImage ? MAX_IMAGE_KB : MAX_DOCUMENT_KB;
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > maxSize) {
        skipped.push({
          success: false,
          fileName: file.name,
          error: `File too large (> ${maxSize / 1024} MB)`,
        });
        continue;
      }
      const lf = toLocal(file);
      lf._blobUrl = lf.uri;
      locals.push(lf);
    }

    try {
      const results = await hook.upload(locals);
      return [...results, ...skipped];
    } finally {
      locals.forEach((lf) => {
        try {
          URL.revokeObjectURL(lf._blobUrl);
        } catch (err) {
          logWarn("Failed to revoke object URL:", lf._blobUrl, err);
        }
      });
    }
  };

  return { ...hook, pickAndUploadImages, pickAndUploadDocuments, uploadFilesFromWeb };
}
