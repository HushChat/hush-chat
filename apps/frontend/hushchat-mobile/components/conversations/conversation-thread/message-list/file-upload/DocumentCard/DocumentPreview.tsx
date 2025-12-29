import React, { useState, useEffect } from "react";
import { Modal, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { IMessageAttachment } from "@/types/chat/types";
import { downloadFileWeb, openFileNative } from "@/utils/messageUtils";
import { PLATFORM } from "@/constants/platformConstants";
import { ToastUtils } from "@/utils/toastUtils";

interface IDocumentPreviewProps {
  visible: boolean;
  attachment: IMessageAttachment | null;
  onClose: () => void;
}

export const DocumentPreview = ({ visible, attachment, onClose }: IDocumentPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      setError(false);
    }
  }, [visible, attachment]);

  if (!visible || !attachment) return null;

  const fileName = attachment.originalFileName || attachment.indexedFileName || "Document";
  const fileUrl = attachment.fileUrl;
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

  const isNativeWeb = [
    "pdf",
    "txt",
    "json",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "mp4",
    "webm",
  ].includes(fileExt);

  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExt);

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      if (PLATFORM.IS_WEB) await downloadFileWeb(fileUrl, fileName);
      else await openFileNative(fileUrl);
    } catch {
      ToastUtils.error("Download failed");
    }
  };

  const handleMobileOpen = async () => {
    if (fileUrl) await openFileNative(fileUrl);
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  const getViewerUrl = () => {
    if (!fileUrl) return "";

    if (isNativeWeb) {
      if (fileExt === "pdf") return `${fileUrl}#toolbar=0&navpanes=0`;
      return fileUrl;
    }

    if (isOfficeDoc) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }

    return "";
  };

  const renderContent = () => {
    if (error || !fileUrl) return renderFallbackUI(true);

    const viewerUrl = getViewerUrl();

    if (!viewerUrl) return renderFallbackUI();

    return (
      <View className="flex-1 w-full h-full relative bg-gray-100 dark:bg-black">
        {loading && (
          <View className="absolute inset-0 flex items-center justify-center z-10">
            <ActivityIndicator size="large" color="#3B82F6" />
            <AppText className="mt-4 text-gray-500">Loading Document...</AppText>
          </View>
        )}

        {PLATFORM.IS_WEB && (
          <iframe
            src={viewerUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={fileName}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </View>
    );
  };

  const renderFallbackUI = (isError = false) => (
    <View className="items-center justify-center p-6 w-full max-w-sm m-auto">
      <View className="w-24 h-24 bg-blue-50 rounded-3xl items-center justify-center mb-6">
        <Ionicons name="document-text" size={48} color={isError ? "#EF4444" : "#3B82F6"} />
      </View>
      <AppText className="text-lg text-center font-medium mb-2">
        {isError ? "Preview Failed" : "Preview Unavailable"}
      </AppText>
      <AppText className="text-sm text-center text-gray-500 mb-6">
        {PLATFORM.IS_WEB
          ? "This file cannot be previewed. Please download it."
          : "Open in device viewer."}
      </AppText>
      {!PLATFORM.IS_WEB ? (
        <Pressable onPress={handleMobileOpen} className="bg-blue-500 px-6 py-3 rounded-full">
          <AppText className="text-white font-semibold">Open Viewer</AppText>
        </Pressable>
      ) : (
        <Pressable onPress={handleDownload} className="bg-gray-900 px-6 py-3 rounded-full">
          <AppText className="text-white font-semibold">Download File</AppText>
        </Pressable>
      )}
    </View>
  );

  return (
    <Modal visible={visible} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white dark:bg-[#111827]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] z-20">
          <View className="flex-1 mr-4">
            <AppText
              className="text-lg font-semibold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {fileName}
            </AppText>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleDownload}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <Ionicons name="download-outline" size={24} color="#3B82F6" />
            </Pressable>
            <Pressable onPress={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        <View className="flex-1 bg-gray-50 dark:bg-black w-full h-full">
          {PLATFORM.IS_WEB ? renderContent() : renderFallbackUI()}
        </View>
      </View>
    </Modal>
  );
};
