import React, { useState, useEffect } from "react";
import { Modal, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import LoadingState from "@/components/LoadingState";
import { DocumentPreviewFallback } from "./DocumentPreviewFallback";
import { IMessageAttachment } from "@/types/chat/types";
import { openFileNative } from "@/utils/messageUtils";
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

  const insets = useSafeAreaInsets();
  const isDark = useAppTheme();

  const themeColors = {
    primary: isDark ? "#563dc4" : "#6B4EFF",
    icon: isDark ? "#9ca3af" : "#6B7280",
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

  const handleOpenNative = async () => {
    if (!fileUrl) return;
    await openFileNative(fileUrl);
  };

  const renderContent = () => {
    if (error || !viewerUrl) {
      return (
        <DocumentPreviewFallback
          error={error}
          message="This file type cannot be viewed inside the app."
          actionLabel="Open in External App"
          onAction={handleOpenNative}
        />
      );
    }

    return (
      <View className="flex-1 relative bg-background-light dark:bg-background-dark w-full h-full">
        {loading && (
          <View className="absolute inset-0 z-10 bg-background-light dark:bg-background-dark items-center justify-center">
            <LoadingState />
          </View>
        )}

        <WebView
          key={componentKey}
          source={{ uri: viewerUrl }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          startInLoadingState={false}
          originWhitelist={["*"]}
          scalesPageToFit={true}
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent={false}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
        className="bg-background-light dark:bg-background-dark"
      >
        <View className="flex-1">
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
                onPress={handleOpenNative}
                className="p-2 active:opacity-80 hover:opacity-70"
              >
                <Ionicons name="download-outline" size={24} color={themeColors.primary} />
              </Pressable>
              <Pressable onPress={onClose} className="p-2 active:opacity-80 hover:opacity-70">
                <Ionicons name="close" size={24} color={themeColors.icon} />
              </Pressable>
            </View>
          </View>

          {renderContent()}
        </View>
      </View>
    </Modal>
  );
};

export default DocumentPreview;
