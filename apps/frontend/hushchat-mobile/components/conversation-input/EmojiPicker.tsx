import React, { useState, useMemo } from "react";
import { Modal, View, TouchableOpacity, FlatList } from "react-native";
import emojiData from "openmoji/data/openmoji.json";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerComponent: React.FC<Props> = ({ visible, onClose, onEmojiSelect }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isDark } = useAuthThemeColors();

  const filteredEmojis = useMemo(() => {
    if (searchQuery === "") return emojiData;

    const query = searchQuery.toLowerCase();
    return emojiData.filter(
      (emoji: any) =>
        emoji.annotation?.toLowerCase().includes(query) || emoji.tags?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderEmojiItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="flex-1 aspect-square justify-center items-center p-2 m-0.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
      onPress={() => {
        onEmojiSelect(item.emoji);
        onClose();
      }}
    >
      <AppText className="text-3xl">{item.emoji}</AppText>
    </TouchableOpacity>
  );

  const containerStyle = PLATFORM.IS_WEB
    ? "h-[500px] w-full max-w-[450px] self-center rounded-xl mb-5"
    : "h-[70%] w-full rounded-t-[20px]";

  const overlayStyle = PLATFORM.IS_WEB ? "justify-center items-center" : "justify-end";

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className={`flex-1 bg-black/50 ${overlayStyle}`}>
        <View className={`bg-white dark:bg-gray-900 overflow-hidden shadow-xl ${containerStyle}`}>
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-lg font-semibold dark:text-white">Select Emoji</AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons
                name="close"
                size={24}
                className="text-gray-500 dark:text-gray-400"
                color={isDark ? "#FAFAF9" : "#050506"}
              />
            </TouchableOpacity>
          </View>

          <View className="p-3">
            <AppTextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-[20px] p-3 text-base dark:text-white"
              style={PLATFORM.IS_WEB ? { outlineWidth: 0 } : undefined}
              placeholder="Search emojis..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredEmojis}
            numColumns={PLATFORM.IS_WEB ? 8 : 6}
            keyExtractor={(item: any) => item.hexcode}
            renderItem={renderEmojiItem}
            contentContainerStyle={{ padding: 8 }}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={5}
            indicatorStyle="default"
            className="custom-scrollbar"
          />
        </View>
      </View>
    </Modal>
  );
};
