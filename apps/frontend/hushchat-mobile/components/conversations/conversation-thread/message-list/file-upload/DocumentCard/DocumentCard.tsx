import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";

import {
  staticStyles,
  dynamicStyles,
} from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard/documentCard.styles";
import { ToastUtils } from "@/utils/toastUtils";
import { PLATFORM } from "@/constants/platformConstants";
import { downloadFileWeb, openFileNative } from "@/utils/messageUtils";
import { getFileExtension } from "@/utils/filePreviewUtils";

type TDocumentCardProps = {
  attachment: IMessageAttachment;
  isCurrentUser: boolean;
  onPreview?: () => void;
};

export const DocumentCard = ({ attachment, isCurrentUser, onPreview }: TDocumentCardProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const ext = getFileExtension(attachment.originalFileName || attachment.indexedFileName);
  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    pdf: { label: "PDF", icon: "document-text", color: "#b11c1f" },
    doc: { label: "WORD", icon: "document-text", color: "#2B6CB0" },
    docx: { label: "WORD", icon: "document-text", color: "#2B6CB0" },
    xls: { label: "EXCEL", icon: "document-text", color: "#16A34A" },
    xlsx: { label: "EXCEL", icon: "document-text", color: "#16A34A" },
    ppt: { label: "PPT", icon: "document-text", color: "#cd4f2e" },
    pptx: { label: "PPT", icon: "document-text", color: "#cd4f2e" },
    unknown: { label: "FILE", icon: "document-text", color: "#6B7280" },
  };

  const { label, icon, color } = typeLabels[ext] || typeLabels.unknown;

  const bgColor = isDark ? "rgb(33, 22, 81)" : "rgb(222, 216, 255)";
  const borderColor = isDark ? "rgba(86, 61, 196, 0.4)" : "rgba(107, 78, 255, 0.3)";
  const textPrimary = isDark ? "#ffffff" : "#35277b";
  const textSecondary = isDark ? "#9ca3af" : "#6B7280";
  const themeColors = {
    primary: isDark ? "#806bdb" : "#442db9",
  };

  const handleDocumentPress = () => {
    if (onPreview) {
      onPreview();
    }
  };

  const handleDownload = async () => {
    const fileUrl = attachment.fileUrl;
    const fileName = attachment.originalFileName || attachment.indexedFileName;

    if (!fileUrl) {
      ToastUtils.error("File URL not available");
      return;
    }

    try {
      if (PLATFORM.IS_WEB) {
        await downloadFileWeb(fileUrl, fileName);
      } else {
        await openFileNative(fileUrl);
      }
    } catch (error) {
      console.error("Error handling document:", error);
      ToastUtils.error("Failed to download document");
    }
  };

  return (
    <View style={dynamicStyles.documentCard(isCurrentUser, bgColor, borderColor)}>
      <View style={staticStyles.documentCardRow}>
        <TouchableOpacity
          onPress={handleDocumentPress}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          style={staticStyles.documentMainContent}
        >
          <View style={staticStyles.documentIconContainer}>
            <Ionicons name={icon as any} size={20} color={color} />
            <AppText style={dynamicStyles.documentIconText(color)}>{label}</AppText>
          </View>

          <View style={staticStyles.documentTextContainer}>
            <AppText numberOfLines={1} style={dynamicStyles.documentTitle(textPrimary)}>
              {attachment.originalFileName || "Document"}
            </AppText>
            <AppText style={dynamicStyles.documentSubtitle(textSecondary)}>
              {label} Document
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          activeOpacity={0.7}
          style={staticStyles.documentDownloadContainer}
        >
          <Ionicons name="download-outline" size={22} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
