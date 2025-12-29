import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TUseAudioRecordingReturn } from "@/hooks/useAudioRecording";

interface RecordingDisplayBarProps {
  audio: TUseAudioRecordingReturn;
}

export const RecordingDisplayBar = ({ audio }: RecordingDisplayBarProps) => (
  <View className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-gray-200 dark:border-gray-800">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
        <AppText className="text-red-600 dark:text-red-400 font-medium">
          Recording {audio.formatDuration(audio.recordingDuration)}
        </AppText>
      </View>
      <Ionicons
        name="close-circle"
        size={24}
        color="#EF4444"
        onPress={audio.handleCancelRecording}
      />
    </View>
  </View>
);
