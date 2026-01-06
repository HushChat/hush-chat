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
    <View className="flex-row items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
      <Ionicons name="pencil" size={18} color="#3B82F6" />
      <View className="flex-1 ml-3">
        <AppText className="text-xs text-blue-600 dark:text-blue-400 font-medium">
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
