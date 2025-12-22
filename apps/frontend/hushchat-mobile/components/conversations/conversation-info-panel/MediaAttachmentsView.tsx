import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { IMessageAttachment, MessageAttachmentTypeEnum } from "@/types/chat/types";
import { useConversationAttachmentsQuery } from "@/query/useGetConversationAttachmentsQuery";
import { MediaPreview } from "@/components/conversations/conversation-thread/composer/image-preview/MediaPreview";
import { getFileType } from "@/utils/files/getFileType";
import { capitalizeFirstLetter } from "@/utils/commonUtils";
import { AttachmentFilterCriteria } from "@/apis/conversation";
import { AppText } from "@/components/AppText";

interface MediaAttachmentsViewProps {
  conversationId: number;
  onBack: () => void;
}

const groupByMonth = (attachments: IMessageAttachment[]): Map<string, IMessageAttachment[]> => {
  const groups = new Map<string, IMessageAttachment[]>();

  attachments.forEach((attachment) => {
    const date = new Date(attachment.updatedAt);
    const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    if (!groups.has(monthYear)) {
      groups.set(monthYear, []);
    }
    groups.get(monthYear)!.push(attachment);
  });

  return groups;
};

const FILE_TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  pdf: { label: "PDF", icon: "document-text", color: "#6B4EFF" },
  word: { label: "WORD", icon: "document-text", color: "#2B6CB0" },
  excel: { label: "EXCEL", icon: "document-text", color: "#16A34A" },
  unknown: { label: "FILE", icon: "document-text", color: "#6B7280" },
};

export default function MediaAttachmentsView({
  conversationId,
  onBack,
}: MediaAttachmentsViewProps) {
  const [activeTab, setActiveTab] = useState<MessageAttachmentTypeEnum>(
    MessageAttachmentTypeEnum.MEDIA
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const { colors } = useAppTheme();

  const typeFilter = activeTab;

  const filtercriteria: AttachmentFilterCriteria = {
    type: typeFilter,
  };

  const { pages, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationAttachmentsQuery(conversationId, filtercriteria, 20);

  const attachments: IMessageAttachment[] = useMemo(
    () => pages?.pages.flatMap((page) => (page.content || []) as IMessageAttachment[]) || [],
    [pages]
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleOpenImage = (index: number) => {
    setSelectedImageIndex(index);
    setShowImagePreview(true);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
    setSelectedImageIndex(-1);
  };

  if (isLoading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <Header title="Attachments" onBack={onBack} color={colors.text} />
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color={colors.tint} />
          <AppText className="text-sm mt-3" style={{ color: colors.icon }}>
            Loading attachments...
          </AppText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <Header title="Attachments" onBack={onBack} color={colors.text} />
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="alert-circle-outline" size={64} color={colors.icon} />
          <AppText className="text-base mt-4 text-center" style={{ color: colors.icon }}>
            Failed to load attachments
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <MediaPreview
        visible={showImagePreview}
        images={attachments}
        initialIndex={selectedImageIndex}
        onClose={handleCloseImagePreview}
      />

      <Header title="Attachments" onBack={onBack} color={colors.text} />

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} colors={colors} />

      {attachments.length === 0 ? (
        <EmptyState activeTab={activeTab} colors={colors} />
      ) : activeTab === MessageAttachmentTypeEnum.MEDIA ? (
        <MediaGrid
          attachments={attachments}
          onScroll={handleScroll}
          onImagePress={handleOpenImage}
          isFetchingNextPage={isFetchingNextPage}
          colors={colors}
        />
      ) : (
        <DocsList
          attachments={attachments}
          onScroll={handleScroll}
          isFetchingNextPage={isFetchingNextPage}
          colors={colors}
        />
      )}
    </View>
  );
}

interface HeaderProps {
  title: string;
  onBack: () => void;
  color: string;
}

function Header({ title, onBack, color }: HeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-3">
      <TouchableOpacity onPress={onBack} className="p-1 mr-3">
        <Ionicons name="chevron-back" size={24} color={color} />
      </TouchableOpacity>
      <AppText className="text-lg font-semibold" style={{ color: color }}>
        {title}
      </AppText>
    </View>
  );
}

function TabBar({ activeTab, onTabChange, colors }: any) {
  return (
    <View className="flex-row justify-between px-4 border-b border-gray-500/20">
      {Object.values(MessageAttachmentTypeEnum).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            className="flex-1 items-center justify-center py-4 relative"
          >
            <AppText
              className="text-base font-medium"
              style={{ color: isActive ? "#6B4EFF" : colors.icon }}
            >
              {capitalizeFirstLetter(tab)}
            </AppText>
            {isActive && <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6B4EFF]" />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function EmptyState({ activeTab, colors }: any) {
  const message =
    activeTab === MessageAttachmentTypeEnum.MEDIA ? "No media files yet" : "No documents yet";
  const iconName =
    activeTab === MessageAttachmentTypeEnum.MEDIA ? "images-outline" : "document-text-outline";

  return (
    <View className="flex-1 justify-center items-center px-8">
      <Ionicons name={iconName as any} size={64} color={colors.icon} />
      <AppText className="text-base mt-4 text-center" style={{ color: colors.icon }}>
        {message}
      </AppText>
    </View>
  );
}

interface MediaGridProps {
  attachments: IMessageAttachment[];
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  onImagePress: (index: number) => void;
  isFetchingNextPage: boolean;
  colors: {
    text: string;
    tint: string;
  };
}

function MediaGrid({
  attachments,
  onScroll,
  onImagePress,
  isFetchingNextPage,
  colors,
}: MediaGridProps) {
  const groupedMedia = groupByMonth(attachments);

  return (
    <ScrollView className="flex-1" onScroll={onScroll} scrollEventThrottle={400}>
      {Array.from(groupedMedia.entries()).map(([monthYear, items]) => (
        <View key={monthYear} className="px-4 pt-6">
          <AppText
            className="text-xs font-semibold tracking-wider mb-3"
            style={{ color: colors.text }}
          >
            {monthYear.toUpperCase()}
          </AppText>
          <View className="flex-row flex-wrap gap-0.5">
            {items.map((item) => {
              const handlePress = () => {
                const index = attachments.findIndex(
                  (att: IMessageAttachment) => att.id === item.id
                );
                if (index !== -1) onImagePress(index);
              };

              return (
                <TouchableOpacity
                  key={item.id}
                  className="w-[115px] h-[115px] rounded-lg overflow-hidden bg-gray-500/20 border-2 border-gray-500/20"
                  onPress={handlePress}
                >
                  <Image
                    source={{ uri: item.fileUrl }}
                    className="flex-1 rounded-md"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {isFetchingNextPage && (
        <View className="p-4 items-center">
          <ActivityIndicator size="small" color={colors.tint} />
        </View>
      )}
    </ScrollView>
  );
}

interface DocsListProps {
  attachments: IMessageAttachment[];
  onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  isFetchingNextPage: boolean;
  colors: {
    text: string;
    icon: string;
    tint: string;
  };
}
function DocsList({ attachments, onScroll, isFetchingNextPage, colors }: DocsListProps) {
  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView className="flex-1" onScroll={onScroll} scrollEventThrottle={400}>
      <View className="p-4">
        {attachments.map((item: IMessageAttachment) => {
          const fileType = getFileType(item.originalFileName || item.indexedFileName);
          const { label, icon, color } = FILE_TYPE_CONFIG[fileType] || FILE_TYPE_CONFIG.unknown;

          return (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center p-3 border border-gray-500/20 rounded-lg mb-2 gap-3"
              onPress={() => handleDownload(item.fileUrl)}
            >
              <View className="items-center justify-center">
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={color} />
                <AppText className="text-[10px] font-semibold mt-1" style={{ color }}>
                  {label}
                </AppText>
              </View>

              <View className="flex-1">
                <AppText
                  className="text-sm font-medium mb-1"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {item.originalFileName}
                </AppText>
                <AppText className="text-xs" style={{ color: colors.icon }}>
                  {item.mimeType}
                </AppText>
              </View>

              <Ionicons name="download-outline" size={20} color={colors.icon} />
            </TouchableOpacity>
          );
        })}
      </View>

      {isFetchingNextPage && (
        <View className="p-4 items-center">
          <ActivityIndicator size="small" color={colors.tint} />
        </View>
      )}
    </ScrollView>
  );
}
