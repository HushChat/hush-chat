import React from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { FilePreviewItem } from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewItem";

type TFileListProps = {
  files: File[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onRemoveFile: (index: number) => void;
  horizontal?: boolean;
};

const FileList = ({
  files,
  selectedIndex,
  onSelect,
  onRemoveFile,
  horizontal = false,
}: TFileListProps) => {
  if (horizontal) {
    return (
      <View className="border-b border-gray-200 dark:border-gray-800 bg-secondary-light/50 dark:bg-background-dark">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {files.map((file, index) => (
            <View key={`${file.name}-${file.lastModified}`} className="mr-2">
              <FilePreviewItem
                file={file}
                index={index}
                isSelected={index === selectedIndex}
                onSelect={() => onSelect(index)}
                onRemove={onRemoveFile}
                compact
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="w-64 bg-secondary-light/50 dark:bg-background-dark items-center border-r border-gray-200 dark:border-gray-800 custom-scrollbar">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator
        contentContainerStyle={styles.scrollContent}
      >
        {files.map((file, index) => (
          <View key={`${file.name}-${file.lastModified}`} className="mx-2">
            <FilePreviewItem
              file={file}
              index={index}
              isSelected={index === selectedIndex}
              onSelect={() => onSelect(index)}
              onRemove={onRemoveFile}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FileList;

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 12,
  },
  horizontalScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
