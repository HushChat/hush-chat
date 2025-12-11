import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IMessage } from "@/types/chat/types";
import { AppText } from "@/components/AppText";

interface EditMessagePreviewProps {
  editMessage: IMessage;
  onCancelEdit: () => void;
}

const EditMessagePreview = ({ editMessage, onCancelEdit }: EditMessagePreviewProps) => {
  let previewText = "";

  if (editMessage.messageText?.trim()) {
    previewText = editMessage.messageText;
  }

  return (
    <View className="mx-4 mb-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-primary-light dark:border-primary-dark">
      <View className="flex-row items-center justify-between p-3">
        <View className="flex-1">
          <AppText className="text-sm font-medium text-primary-light dark:text-primary-dark mb-1">
            Edit message
          </AppText>
          <AppText
            className="text-sm text-gray-700 dark:text-gray-300"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {previewText}
          </AppText>
        </View>
        <Pressable
          onPress={onCancelEdit}
          className="ml-2 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
};

export default EditMessagePreview;
