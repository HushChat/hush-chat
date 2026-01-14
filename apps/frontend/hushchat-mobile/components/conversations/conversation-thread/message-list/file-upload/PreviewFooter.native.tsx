import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";

type TPreviewFooterProps = {
  isSending: boolean;
  isAtLimit: boolean;
  hasFiles: boolean;
  onClose: () => void;
  onSend: () => void;
  fileCount: number;
};

const PreviewFooter = ({ fileCount }: TPreviewFooterProps) => {
  return (
    <View className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
      <AppText className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark">
        {fileCount} {fileCount === 1 ? "file" : "files"} selected
      </AppText>
    </View>
  );
};

export default PreviewFooter;
