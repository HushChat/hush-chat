import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

type TPreviewFooterProps = {
  isSending: boolean;
  isAtLimit: boolean;
  hasFiles: boolean;
  onAddMore: () => void;
  onClose: () => void;
  onSend: () => void;
  fileCount: number;
};

const PreviewFooter = ({
  isSending,
  isAtLimit,
  hasFiles,
  onAddMore,
  onClose,
  onSend,
  fileCount,
}: TPreviewFooterProps) => {
  const isMobile = useIsMobileLayout();

  return (
    <View
      className={classNames(
        "border-t border-gray-200 dark:border-gray-800 bg-background-light/80 dark:bg-background-dark/80 flex-row items-center",
        isMobile ? "px-3 py-2 justify-between" : "px-4 py-3 justify-between"
      )}
    >
      <TouchableOpacity
        onPress={onAddMore}
        disabled={isSending || isAtLimit}
        className={classNames(
          "rounded-lg border border-primary-light/50 dark:border-primary-dark/60",
          isMobile ? "px-2.5 py-1.5" : "px-3 py-2",
          isSending || isAtLimit ? "opacity-50" : "bg-secondary-light/40 dark:bg-secondary-dark/50"
        )}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="add-circle-outline"
            size={isMobile ? 14 : 16}
            color={isSending || isAtLimit ? "#9ca3af" : "#6B4EFF"}
          />
          <AppText
            className={classNames(
              "ml-1.5 font-medium",
              isMobile ? "text-xs" : "text-sm",
              isSending || isAtLimit
                ? "text-text-secondary-light dark:text-text-secondary-dark"
                : "text-primary-light dark:text-primary-dark"
            )}
          >
            {isAtLimit ? "Limit" : "Add More"}
          </AppText>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onClose}
          disabled={isSending}
          className={classNames(
            "rounded-lg mr-2",
            isMobile ? "px-3 py-1.5" : "px-4 py-2",
            isSending
              ? "bg-secondary-light/40 dark:bg-secondary-dark/50"
              : "bg-secondary-light/60 dark:bg-secondary-dark/70"
          )}
        >
          <AppText
            className={classNames(
              "font-medium text-text-primary-light dark:text-text-primary-dark",
              isMobile ? "text-xs" : "text-sm"
            )}
          >
            Cancel
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSend}
          disabled={isSending || !hasFiles}
          className={classNames(
            "rounded-lg flex-row items-center",
            isMobile ? "px-3 py-1.5" : "px-5 py-2",
            isSending || !hasFiles
              ? "bg-primary-light/40 dark:bg-primary-dark/40"
              : "bg-primary-light dark:bg-primary-dark"
          )}
        >
          {isSending ? (
            <AppText
              className={classNames(
                "text-white/90 font-semibold",
                isMobile ? "text-xs" : "text-sm"
              )}
            >
              Sending…
            </AppText>
          ) : (
            <>
              <Ionicons name="send" size={isMobile ? 14 : 16} color="#fff" />
              <AppText
                className={classNames(
                  "text-white font-semibold ml-1.5",
                  isMobile ? "text-xs" : "text-sm"
                )}
              >
                Send{fileCount > 1 ? ` (${fileCount})` : ""}
              </AppText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PreviewFooter;
