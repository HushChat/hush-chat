import React, { useState, useEffect } from "react";
import { Modal, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import LoadingState from "@/components/LoadingState";
import { IMessageAttachment } from "@/types/chat/types";
import { downloadFileWeb } from "@/utils/messageUtils";
import { getDocumentViewerUrl } from "@/utils/filePreviewUtils";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IDocumentPreviewProps {
  visible: boolean;
  attachment: IMessageAttachment | null;
  onClose: () => void;
}

export const DocumentPreview = ({ visible, attachment, onClose }: IDocumentPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isDark = useAppTheme();

  const themeColors = {
    primary: isDark ? "#563dc4" : "#6B4EFF",
    icon: isDark ? "#9ca3af" : "#6B7280",
    error: "#EF4444",
  };

  useEffect(() => {
    if (visible && attachment) {
      setLoading(true);
      setError(false);
    }
  }, [visible, attachment]);

  if (!visible || !attachment) return null;

  const fileName = attachment.originalFileName || attachment.indexedFileName || "Document";
  const fileUrl = attachment.fileUrl;
  const viewerUrl = getDocumentViewerUrl(fileUrl, fileName);
  const componentKey = `${fileUrl}-${visible ? "open" : "closed"}`;

  const handleDownload = async () => {
    if (!fileUrl) return;
    await downloadFileWeb(fileUrl, fileName);
  };

  const renderContent = () => {
    if (error || !viewerUrl) return renderFallbackUI();

    return (
      <View className="flex-1 relative bg-background-light dark:bg-background-dark w-full h-full">
        {loading && (
          <View className="absolute inset-0 z-10 bg-background-light dark:bg-background-dark items-center justify-center">
            <LoadingState />
          </View>
        )}

        <iframe
          key={componentKey}
          src={viewerUrl}
          style={{ width: "100%", height: "100%", border: "none" }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </View>
    );
  };

  const renderFallbackUI = () => (
    <View className="flex-1 items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      <View className="w-24 h-24 bg-secondary-light dark:bg-secondary-dark rounded-3xl items-center justify-center mb-6">
        <Ionicons
          name="document-text"
          size={48}
          color={error ? themeColors.error : themeColors.primary}
        />
      </View>
      <AppText className="text-lg text-center font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
        {error ? "Preview Failed" : "Preview Unavailable"}
      </AppText>
      <AppText className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mb-6">
        We could not display this file directly.
      </AppText>
      <Pressable
        onPress={handleDownload}
        className={classNames(
          "bg-primary-light dark:bg-primary-dark",
          "px-6 py-3 rounded-full active:opacity-90 hover:opacity-90"
        )}
      >
        <AppText className="text-white font-semibold">Download File</AppText>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} transparent={false}>
      <View className="flex-1 bg-background-light dark:bg-background-dark">
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
            <Pressable onPress={handleDownload} className="p-2 active:opacity-80 hover:opacity-70">
              <Ionicons name="download-outline" size={24} color={themeColors.primary} />
            </Pressable>
            <Pressable onPress={onClose} className="p-2 active:opacity-80 hover:opacity-70">
              <Ionicons name="close" size={24} color={themeColors.icon} />
            </Pressable>
          </View>
        </View>

        {renderContent()}
      </View>
    </Modal>
  );
};

export default DocumentPreview;
