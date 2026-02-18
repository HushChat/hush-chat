import { View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { AppText } from "@/components/AppText";

interface MessageLabelProps {
  isForwardedMessage?: boolean;
  isMessageEdited?: boolean;
  isCurrentUser: boolean;
}

interface IMessageMetaLabelProps {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  iconColor: string;
  textColorClass: string;
}

const MessageMetaLabel = ({ icon, label, iconColor, textColorClass }: IMessageMetaLabelProps) => {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon} size={12} color={iconColor} />
      <AppText className={classNames("text-xs italic", textColorClass)}>{label}</AppText>
    </View>
  );
};

export const MessageLabel = ({
  isForwardedMessage,
  isMessageEdited,
  isCurrentUser,
}: MessageLabelProps) => {
  if (!isForwardedMessage && !isMessageEdited) return null;

  const textColorClass = isCurrentUser ? "text-primary-light" : "text-gray-500 dark:text-gray-400";
  const iconColor = isCurrentUser ? "#6B4EFF" : "#6B7280";

  return (
    <View
      className={classNames(
        "flex-row items-center gap-2 mb-1",
        isCurrentUser ? "self-end" : "self-start"
      )}
    >
      {isForwardedMessage && (
        <MessageMetaLabel
          icon="arrow-redo-outline"
          label="Forwarded"
          iconColor={iconColor}
          textColorClass={textColorClass}
        />
      )}

      {isMessageEdited && (
        <MessageMetaLabel
          icon="pencil"
          label="Edited"
          iconColor={iconColor}
          textColorClass={textColorClass}
        />
      )}
    </View>
  );
};
