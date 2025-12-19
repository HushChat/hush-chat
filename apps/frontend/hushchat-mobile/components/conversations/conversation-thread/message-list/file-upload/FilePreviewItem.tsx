import React, { useEffect, useMemo, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import classNames from "classnames";
import { colorScheme } from "nativewind";

import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { DOC_EXTENSIONS, SIZES, VIDEO_EXTENSIONS } from "@/constants/mediaConstants";
import { AppText } from "@/components/AppText";

type FileType = "image" | "video" | "document";

interface FilePreviewItemProps {
  file: File;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (index: number) => void;
}

interface ImagePreviewProps {
  uri: string;
  isSelected: boolean;
}

interface VideoPreviewProps {
  uri: string;
  isSelected: boolean;
}

interface DocumentPreviewProps {
  extension: string;
  iconColor: string;
  isSelected: boolean;
}

const BYTES_PER_KB = 1024;
const PREVIEW_SIZE = 48;

const getFileTypeFromName = (fileName: string): FileType => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  if (DOC_EXTENSIONS.includes(extension)) return "document";
  if (VIDEO_EXTENSIONS.includes(extension)) return "video";
  return "image";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const unitIndex = Math.min(
    SIZES.length - 1,
    Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB))
  );

  const size = bytes / Math.pow(BYTES_PER_KB, unitIndex);
  return `${parseFloat(size.toFixed(2))} ${SIZES[unitIndex]}`;
};

const getFileExtension = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toUpperCase();
  return extension || "FILE";
};

const SelectedBadge: React.FC = () => (
  <View className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full items-center justify-center bg-primary-light dark:bg-primary-dark">
    <Ionicons name="checkmark" size={12} color="#fff" />
  </View>
);

const ImagePreviewThumbnail: React.FC<ImagePreviewProps> = ({ uri, isSelected }) => (
  <View className="relative mr-3">
    <Image
      source={{ uri }}
      style={styles.previewImage}
      className="rounded-lg"
      cachePolicy="memory-disk"
      contentFit="cover"
    />
    {isSelected && <SelectedBadge />}
  </View>
);

const VideoPreviewThumbnail: React.FC<VideoPreviewProps> = ({ uri, isSelected }) => (
  <View className="relative mr-3">
    <View className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
      <Image
        source={{ uri }}
        style={styles.previewImage}
        className="rounded-lg"
        cachePolicy="memory-disk"
        contentFit="cover"
      />
      <View className="absolute inset-0 items-center justify-center bg-black/30">
        <Ionicons name="play-circle" size={20} color="#fff" />
      </View>
    </View>
    {isSelected && <SelectedBadge />}
  </View>
);

const DocumentPreviewThumbnail: React.FC<DocumentPreviewProps> = ({
  extension,
  iconColor,
  isSelected,
}) => (
  <View className="relative mr-3 w-12 h-12 rounded-lg items-center justify-center bg-gray-200 dark:bg-gray-700">
    <Ionicons name="document-text" size={24} color={iconColor} />
    <AppText className="text-[8px] font-bold mt-0.5" style={{ color: iconColor }}>
      {extension}
    </AppText>
    {isSelected && <SelectedBadge />}
  </View>
);

const useFilePreview = (file: File | undefined) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileType, setFileType] = useState<FileType>("image");

  useEffect(() => {
    if (!file) return;

    const type = getFileTypeFromName(file.name);
    setFileType(type);

    if (type === "document") {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return { previewUrl, fileType };
};

const useIconColor = (): string => {
  const isDark = colorScheme.get() === "dark";
  return isDark ? "#ffffff" : "#6B4EFF";
};

export const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  file,
  index,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const { previewUrl, fileType } = useFilePreview(file);
  const iconColor = useIconColor();

  const formattedSize = useMemo(() => formatFileSize(file?.size ?? 0), [file?.size]);

  const fileExtension = useMemo(() => getFileExtension(file?.name || ""), [file?.name]);

  const containerClasses = classNames(
    "w-56 relative mb-2 rounded-xl p-2 border",
    "bg-secondary-light/60 dark:bg-secondary-dark/70",
    "border-gray-200 dark:border-gray-700",
    isSelected && "border border-primary-light dark:border-primary-dark shadow-sm"
  );

  const handleRemove = () => onRemove(index);

  const renderPreview = () => {
    switch (fileType) {
      case "video":
        return <VideoPreviewThumbnail uri={previewUrl} isSelected={isSelected} />;
      case "document":
        return (
          <DocumentPreviewThumbnail
            extension={fileExtension}
            iconColor={iconColor}
            isSelected={isSelected}
          />
        );
      case "image":
      default:
        return <ImagePreviewThumbnail uri={previewUrl} isSelected={isSelected} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      className={containerClasses}
      accessibilityLabel={`${file?.name || "File"}, ${formattedSize}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View className="flex-row items-center">
        {renderPreview()}

        <View className="flex-1 min-w-0 pr-2">
          <AppText
            className="text-[12px] leading-[16px] font-semibold text-text-primary-light dark:text-text-primary-dark"
            numberOfLines={2}
          >
            {file?.name || "file"}
          </AppText>

          <View className="mt-1 flex-row items-center">
            <View className="px-1.5 py-0.5 rounded bg-secondary-light/80 dark:bg-secondary-dark/80">
              <AppText className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                {formattedSize}
              </AppText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRemove}
          className="ml-1 p-1 rounded-md bg-transparent"
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          accessibilityLabel="Remove file"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  previewImage: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
  },
});

export default FilePreviewItem;
