import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { AppText } from "@/components/AppText";

type TPreviewFooterProps = {
  isSending: boolean;
  hasFiles: boolean;
  onSend: () => void;
  fileCount: number;
};

const PreviewFooter = ({ isSending, hasFiles, onSend, fileCount }: TPreviewFooterProps) => {
  return (
    <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark pb-safe">
      <TouchableOpacity
        onPress={onSend}
        disabled={isSending || !hasFiles}
        className={classNames(
          "w-full py-3.5 rounded-xl flex-row items-center justify-center shadow-sm",
          isSending || !hasFiles
            ? "bg-primary-light/60 dark:bg-primary-dark/60"
            : "bg-primary-light dark:bg-primary-dark"
        )}
      >
        {isSending ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
            <AppText className="text-white font-semibold text-base">Sending...</AppText>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Ionicons name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
            <AppText className="text-white font-semibold text-base">
              Send {fileCount > 0 ? `${fileCount} ${fileCount === 1 ? "File" : "Files"}` : ""}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PreviewFooter;
