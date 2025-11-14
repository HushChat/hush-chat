import React from "react";
import { View, StyleSheet } from "react-native";
import classNames from "classnames";
import { PLATFORM } from "@/constants/platformConstants";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

const COLOR_MUTED = "#9CA3AF";

type DisabledMessageInputProps = {
  userName?: string;
  customMessage?: string;
};

const DisabledMessageInput = ({ customMessage }: DisabledMessageInputProps) => {
  const displayMessage = customMessage || `Messaging is currently unavailable`;

  return (
    <View
      className={classNames(
        "flex-row items-center",
        "bg-background-light dark:bg-background-dark",
        "border-gray-200 dark:border-gray-800",
        PLATFORM.IS_WEB ? "p-4" : "p-3"
      )}
    >
      <View className={classNames("flex-1", PLATFORM.IS_WEB ? "mx-4" : "mx-3")}>
        <View
          className={classNames(
            "flex-row items-center justify-center rounded-3xl",
            "bg-gray-100 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700",
            PLATFORM.IS_WEB ? "px-6 py-4" : "px-5 py-3"
          )}
          style={PLATFORM.IS_WEB ? styles.minHeightWeb : styles.minHeightNative}
        >
          <Ionicons name="ban" size={16} color={COLOR_MUTED} style={styles.disabledContainer} />
          <AppText
            className="text-sm text-gray-500 dark:text-gray-400 font-medium"
            style={styles.mutedText}
          >
            {displayMessage}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default DisabledMessageInput;

const styles = StyleSheet.create({
  disabledContainer: {
    marginRight: 8,
  },
  mutedText: {
    color: COLOR_MUTED,
  },
  minHeightWeb: {
    minHeight: 48,
  },
  minHeightNative: {
    minHeight: 44,
  },
});
