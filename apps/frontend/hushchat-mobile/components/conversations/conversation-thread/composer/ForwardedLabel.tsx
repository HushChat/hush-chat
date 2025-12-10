import { View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { AppText } from "@/components/AppText";

export const ForwardedLabel = ({
  isForwardedMessage,
  isCurrentUser,
}: {
  isForwardedMessage: boolean;
  isCurrentUser: boolean;
}) => {
  if (!isForwardedMessage) return null;

  return (
    <View
      className={classNames(
        "flex-row items-center gap-1 mb-1",
        isCurrentUser ? "self-end" : "self-start"
      )}
    >
      <Ionicons
        name="arrow-redo-outline"
        size={12}
        className={classNames(isCurrentUser ? "text-primary-light" : "text-gray-500")}
      />

      <AppText
        className={classNames(
          "text-xs italic",
          isCurrentUser ? "text-primary-light" : "text-gray-500 dark:text-gray-400"
        )}
      >
        Forwarded
      </AppText>
    </View>
  );
};
