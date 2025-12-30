import React, { useState } from "react";
import { Modal, View, Pressable, ActivityIndicator, Platform, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { useColorScheme } from "nativewind";
import classNames from "classnames";

import { AppText } from "@/components/AppText";
import { IMessageAttachment } from "@/types/chat/types";
import { openFileNative } from "@/utils/messageUtils";

// Helper to get active hex colors for Icon/Loader props
const useThemeColors = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    primary: isDark ? "#563dc4" : "#6B4EFF",
    icon: isDark ? "#9ca3af" : "#6B7280",
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

  if (!visible || !attachment) return null;

  const fileName = attachment.originalFileName || attachment.indexedFileName || "Document";
  const fileUrl = attachment.fileUrl;
  const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

  const isOfficeDoc = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(fileExt);
  const isPdf = fileExt === "pdf";

  const handleOpenExternal = async () => {
    if (fileUrl) await openFileNative(fileUrl);
  };

  const getMobileViewerUrl = () => {
    if (!fileUrl) return "";

    if (Platform.OS === "android") {
      if (isPdf) {
        return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(fileUrl)}`;
      }
      if (isOfficeDoc) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
      }
      return fileUrl;
    }
    return fileUrl;
  };

  const renderContent = () => {
    const viewerUrl = getMobileViewerUrl();

    if (error || !viewerUrl) return renderFallbackUI();

    return (
      <View className="flex-1 bg-white relative">
        {loading && (
          <View className="absolute inset-0 flex items-center justify-center z-10 bg-background-light dark:bg-background-dark">
            <ActivityIndicator size="large" color={themeColors.primary} />
            <AppText className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
              Loading Preview...
            </AppText>
          </View>
        )}
        <WebView
          source={{ uri: viewerUrl }}
          style={{ flex: 1, backgroundColor: "transparent" }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          startInLoadingState={true}
          renderLoading={() => <View />}
          originWhitelist={["*"]}
        />
      </View>
    );
  };

  const renderFallbackUI = () => (
    <View className="flex-1 items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      <View className="w-24 h-24 bg-secondary-light dark:bg-secondary-dark rounded-3xl items-center justify-center mb-6">
        <Ionicons name="document-text" size={48} color={themeColors.primary} />
      </View>
      <AppText className="text-lg text-center font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
        Preview Unavailable
      </AppText>
      <AppText className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mb-6">
        This file type cannot be viewed inside the app.
      </AppText>
      <Pressable
        onPress={handleOpenExternal}
        className={classNames(
          "bg-primary-light dark:bg-primary-dark",
          "px-6 py-3 rounded-full active:opacity-90"
        )}
      >
        <AppText className="text-white font-semibold">Open in External App</AppText>
      </Pressable>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1">
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
              <Pressable onPress={handleOpenExternal} className="p-2 active:opacity-80">
                <Ionicons name="download-outline" size={24} color={themeColors.primary} />
              </Pressable>
              <Pressable onPress={onClose} className="p-2 active:opacity-80">
                <Ionicons name="close" size={24} color={themeColors.icon} />
              </Pressable>
            </View>
          </View>

          {renderContent()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};
