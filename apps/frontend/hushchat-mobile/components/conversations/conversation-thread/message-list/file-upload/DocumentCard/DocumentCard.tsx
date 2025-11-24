import React from "react";
import { TouchableOpacity, View, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";

import {
  staticStyles,
  dynamicStyles,
} from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard/documentCard.styles";

type TDocumentCardProps = {
  attachment: IMessageAttachment;
  isCurrentUser: boolean;
};

export const DocumentCard = ({ attachment, isCurrentUser }: TDocumentCardProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const fileType = getFileType(attachment.originalFileName || attachment.indexedFileName);
  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    pdf: { label: "PDF", icon: "document-text", color: "#6B4EFF" },
    word: { label: "WORD", icon: "document-text", color: "#2B6CB0" },
    excel: { label: "EXCEL", icon: "document-text", color: "#16A34A" },
    unknown: { label: "FILE", icon: "document-text", color: "#6B7280" },
  };

  const { label, icon, color } = typeLabels[fileType] || typeLabels.unknown;

  const bgColor = isDark ? "rgba(86, 61, 196, 0.25)" : "rgba(107, 78, 255, 0.15)";
  const borderColor = isDark ? "rgba(86, 61, 196, 0.4)" : "rgba(107, 78, 255, 0.3)";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6B7280";

  const handlePress = () => {
    if (attachment.fileUrl) Linking.openURL(attachment.fileUrl);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={dynamicStyles.documentCard(isCurrentUser, bgColor, borderColor)}
    >
      <View style={staticStyles.documentCardRow}>
        <View style={staticStyles.documentIconContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
          <AppText style={dynamicStyles.documentIconText(color)}>{label}</AppText>
        </View>

        <View style={staticStyles.documentTextContainer}>
          <AppText numberOfLines={2} style={dynamicStyles.documentTitle(textPrimary)}>
            {attachment.originalFileName || "Document"}
          </AppText>
          <AppText style={dynamicStyles.documentSubtitle(textSecondary)}>{label} Document</AppText>
        </View>

        <View style={staticStyles.documentDownloadContainer}>
          <Ionicons name="download-outline" size={16} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
