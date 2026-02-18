import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { IMessage } from "@/types/chat/types";

interface IEditPreviewProps {
  message: IMessage;
  onCancelEdit: () => void;
}

export const EditPreview = ({ message, onCancelEdit }: IEditPreviewProps) => {
  return (
    <View className="flex-row items-center px-4 py-2 bg-secondary-light dark:bg-secondary-dark border-l-4 border-primary-light dark:border-primary-dark">
      <Ionicons name="pencil" size={18} color="#6B4EFF" />
      <View className="flex-1 ml-3">
        <AppText className="text-xs text-primary-light dark:text-primary-dark font-medium">
          Editing Message
        </AppText>
        <AppText className="text-sm text-gray-600 dark:text-gray-300 mt-0.5" numberOfLines={1}>
          {message.messageText}
        </AppText>
      </View>
      <TouchableOpacity onPress={onCancelEdit} className="p-2">
        <Ionicons name="close" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

export default EditPreview;
