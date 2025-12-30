import React, { useState, useEffect } from "react";
import { Modal, View, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import classNames from "classnames";

import { AppText } from "@/components/AppText";
import { IMessageAttachment } from "@/types/chat/types";
import { downloadFileWeb } from "@/utils/messageUtils";

// Helper to get active hex colors for Icon/Loader props
const useThemeColors = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    primary: isDark ? "#563dc4" : "#6B4EFF", // primary-dark : primary-light
    icon: isDark ? "#9ca3af" : "#6B7280", // text-secondary-dark : text-secondary-light
    error: "#EF4444",
  };
};

interface IDocumentPreviewProps {
  visible: boolean;
  attachment: IMessageAttachment | null;
  onClose: () => void;
}

export const DocumentPreview = ({ visible, attachment, onClose }: IDocumentPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const themeColors = useThemeColors();

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

  const isNativeWeb = ["pdf", "txt", "json", "png", "jpg", "jpeg", "gif", "mp4", "webm"].includes(
    fileExt
  );
  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExt);

  const handleDownload = async () => {
    if (fileUrl) await downloadFileWeb(fileUrl, fileName);
  };

  const getViewerUrl = () => {
    if (!fileUrl) return "";
    if (isNativeWeb) {
      return fileExt === "pdf" ? `${fileUrl}#toolbar=0&navpanes=0` : fileUrl;
    }
    if (isOfficeDoc) {
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    }
    return "";
  };

  const renderContent = () => {
    const viewerUrl = getViewerUrl();
    if (error || !viewerUrl) return renderFallbackUI(true);

    return (
      <View className="flex-1 w-full h-full relative bg-background-light dark:bg-background-dark">
        {loading && (
          <View className="absolute inset-0 flex items-center justify-center z-10 bg-background-light dark:bg-background-dark">
            <ActivityIndicator size="large" color={themeColors.primary} />
            <AppText className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
              Loading Document...
            </AppText>
          </View>
        )}
        <iframe
          src={viewerUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={fileName}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </View>
    );
  };

  const renderFallbackUI = (isError = false) => (
    <View className="items-center justify-center p-6 w-full max-w-sm m-auto">
      <View className="w-24 h-24 bg-secondary-light dark:bg-secondary-dark rounded-3xl items-center justify-center mb-6">
        <Ionicons
          name="document-text"
          size={48}
          color={isError ? themeColors.error : themeColors.primary}
        />
      </View>
      <AppText className="text-lg text-center font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
        {isError ? "Preview Failed" : "Preview Unavailable"}
      </AppText>
      <Pressable
        onPress={handleDownload}
        className={classNames(
          "bg-primary-light dark:bg-primary-dark",
          "px-6 py-3 rounded-full mt-4 hover:opacity-90 active:opacity-80"
        )}
      >
        <AppText className="text-white font-semibold">Download File</AppText>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
          <View className="flex-1 mr-4">
            <AppText
              className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark"
              numberOfLines={1}
            >
              {fileName}
            </AppText>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={handleDownload}
              className="p-2 bg-secondary-light dark:bg-secondary-dark rounded-full hover:opacity-80 active:opacity-70"
            >
              <Ionicons name="download-outline" size={24} color={themeColors.primary} />
            </Pressable>
            <Pressable
              onPress={onClose}
              className="p-2 bg-secondary-light dark:bg-secondary-dark rounded-full hover:opacity-80 active:opacity-70"
            >
              <Ionicons name="close" size={24} color={themeColors.icon} />
            </Pressable>
          </View>
        </View>
        {renderContent()}
      </View>
    </Modal>
  );
};
