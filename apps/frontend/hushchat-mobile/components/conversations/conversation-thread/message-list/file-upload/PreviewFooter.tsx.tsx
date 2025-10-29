import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";

type TPreviewFooterProps = {
  isSending: boolean;
  isAtLimit: boolean;
  hasFiles: boolean;
  onAddMore: () => void;
  onClose: () => void;
  onSend: () => void;
};

const PreviewFooter = ({
  isSending,
  isAtLimit,
  hasFiles,
  onAddMore,
  onClose,
  onSend,
}: TPreviewFooterProps) => (
  <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 flex-row items-center justify-between">
    <TouchableOpacity
      onPress={onAddMore}
      disabled={isSending || isAtLimit}
      className={classNames(
        "px-3 py-2 rounded-lg border border-primary-light/50 dark:border-primary-dark/60",
        isSending || isAtLimit
          ? "opacity-50"
          : "bg-secondary-light/40 dark:bg-secondary-dark/50",
      )}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="add-circle-outline"
          size={16}
          color={isSending || isAtLimit ? "#9ca3af" : "#6B4EFF"}
        />
        <Text
          className={classNames(
            "ml-2 text-sm font-medium",
            isSending || isAtLimit
              ? "text-text-secondary-light dark:text-text-secondary-dark"
              : "text-primary-light dark:text-primary-dark",
          )}
        >
          {isAtLimit ? "Limit Reached" : "Add More"}
        </Text>
      </View>
    </TouchableOpacity>

    <View className="flex-row items-center">
      <TouchableOpacity
        onPress={onClose}
        disabled={isSending}
        className={classNames(
          "px-4 py-2 rounded-lg mr-2",
          isSending
            ? "bg-secondary-light/40 dark:bg-secondary-dark/50"
            : "bg-secondary-light/60 dark:bg-secondary-dark/70",
        )}
      >
        <Text className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSend}
        disabled={isSending || !hasFiles}
        className={classNames(
          "px-5 py-2 rounded-lg flex-row items-center",
          isSending || !hasFiles
            ? "bg-primary-light/40 dark:bg-primary-dark/40"
            : "bg-primary-light dark:bg-primary-dark",
        )}
      >
        {isSending ? (
          <>
            <View
              className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full mr-2"
              style={{ transform: [{ rotate: "45deg" }] }}
            />
            <Text className="text-white/90 font-semibold text-sm">
              Sending…
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="send" size={16} color="#fff" />
            <Text className="text-white font-semibold text-sm ml-2">Send</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

export default PreviewFooter;
