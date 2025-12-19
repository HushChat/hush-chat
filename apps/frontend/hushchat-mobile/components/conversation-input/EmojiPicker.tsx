import React, { useState, useMemo } from "react";
import { Modal, View, TouchableOpacity, FlatList, Image } from "react-native";
import classNames from "classnames";
import emojiData from "openmoji/data/openmoji.json";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { BuildConstantKeys, getBuildConstant } from "@/constants/build-constants";

interface IEmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  anchorPosition?: { top?: number; bottom?: number; left?: number; right?: number };
}

interface EmojiItem {
  hexcode: string;
  emoji: string;
  annotation?: string;
  tags?: string;
  group?: string;
  subgroups?: string;
}

const EMOJI_BASE_URL = getBuildConstant(BuildConstantKeys.EMOJI_BASE_URL);
const EMOJI_SIZE = 32;

export const EmojiPickerComponent: React.FC<IEmojiPickerProps> = ({
  visible,
  onClose,
  onEmojiSelect,
  anchorPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { isDark } = useAppTheme();

  const typedEmojiData = emojiData as EmojiItem[];

  const filteredEmojis = useMemo(() => {
    if (searchQuery === "") return typedEmojiData;

    const query = searchQuery.toLowerCase();
    return typedEmojiData.filter(
      (emoji) =>
        emoji.annotation?.toLowerCase().includes(query) || emoji.tags?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const getEmojiImageUrl = (hexcode: string): string => {
    return `${EMOJI_BASE_URL}${hexcode}.png`;
  };

  const handleEmojiSelect = (emoji: EmojiItem) => {
    onEmojiSelect(emoji.emoji);
    setSearchQuery("");
  };

  const renderEmojiItem = ({ item }: { item: EmojiItem }) => (
    <TouchableOpacity
      className="flex-1 aspect-square justify-center items-center p-2 m-0.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
      onPress={() => handleEmojiSelect(item)}
    >
      <Image
        source={{ uri: getEmojiImageUrl(item.hexcode) }}
        style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );

  const getPopoverStyle = () => {
    if (!PLATFORM.IS_WEB) return {};

    const defaultPosition = {
      position: "absolute" as const,
      bottom: 60,
      right: 20,
    };

    if (!anchorPosition) return defaultPosition;

    return {
      position: "absolute" as const,
      ...anchorPosition,
    };
  };

  if (PLATFORM.IS_WEB) {
    return visible ? (
      <View className="fixed inset-0 z-50" style={{ pointerEvents: visible ? "auto" : "none" }}>
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />

        <View
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[80vh]"
          style={[getPopoverStyle(), { width: 400, height: 450 }]}
        >
          <View className="flex-row justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-base font-semibold dark:text-white">Select Emoji</AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="close" size={20} color={isDark ? "#FAFAF9" : "#050506"} />
            </TouchableOpacity>
          </View>

          <View className="p-2">
            <AppTextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-[20px] p-2.5 text-sm dark:text-white"
              style={{ outlineWidth: 0 }}
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
            numColumns={8}
            keyExtractor={(item) => item.hexcode}
            renderItem={renderEmojiItem}
            contentContainerStyle={{ padding: 8 }}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={5}
            className="custom-scrollbar"
          />
        </View>
      </View>
    ) : null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View
        className={classNames("flex-1 bg-black/50", {
          "justify-end": !PLATFORM.IS_WEB,
        })}
      >
        <View
          className={classNames("bg-white dark:bg-gray-900 overflow-hidden shadow-xl", {
            "h-[70%] w-full rounded-t-[20px]": !PLATFORM.IS_WEB,
          })}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-lg font-semibold dark:text-white">Select Emoji</AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
            >
              <Ionicons name="close" size={24} color={isDark ? "#FAFAF9" : "#050506"} />
            </TouchableOpacity>
          </View>

          <View className="p-3">
            <AppTextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-[20px] p-3 text-base dark:text-white"
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
            numColumns={6}
            keyExtractor={(item) => item.hexcode}
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
