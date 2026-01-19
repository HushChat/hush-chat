import React, { useState, useMemo } from "react";
import { Modal, View, TouchableOpacity, FlatList, Image, ScrollView } from "react-native";
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

interface EmojiCategory {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const CATEGORIES: EmojiCategory[] = [
  { id: "all", icon: "grid", label: "All" },
  { id: "smileys-emotion", icon: "happy", label: "Smileys" },
  { id: "people-body", icon: "body", label: "People" },
  { id: "animals-nature", icon: "paw", label: "Nature" },
  { id: "food-drink", icon: "fast-food", label: "Food" },
  { id: "travel-places", icon: "airplane", label: "Travel" },
  { id: "activities", icon: "football", label: "Activities" },
  { id: "objects", icon: "bulb", label: "Objects" },
  { id: "symbols", icon: "heart", label: "Symbols" },
  { id: "flags", icon: "flag", label: "Flags" },
];

const EMOJI_BASE_URL = getBuildConstant(BuildConstantKeys.EMOJI_BASE_URL);
const EMOJI_SIZE = 32;
const COLS_WEB = 8;
const COLS_MOBILE = 6;
const NUM_COLUMNS = PLATFORM.IS_WEB ? COLS_WEB : COLS_MOBILE;

export const EmojiPickerComponent: React.FC<IEmojiPickerProps> = ({
  visible,
  onClose,
  onEmojiSelect,
  anchorPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { isDark } = useAppTheme();

  const typedEmojiData = emojiData as EmojiItem[];

  const filteredEmojis = useMemo(() => {
    if (searchQuery !== "") {
      const query = searchQuery.toLowerCase();
      return typedEmojiData.filter(
        (emoji) =>
          emoji.annotation?.toLowerCase().includes(query) ||
          emoji.tags?.toLowerCase().includes(query)
      );
    }

    if (activeCategory === "all") {
      return typedEmojiData;
    }

    return typedEmojiData.filter((emoji) => emoji.group === activeCategory);
  }, [searchQuery, activeCategory]);

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
      style={{ maxWidth: `${100 / NUM_COLUMNS}%` }}
      onPress={() => handleEmojiSelect(item)}
    >
      {PLATFORM.IS_WEB ? (
        <Image
          source={{ uri: getEmojiImageUrl(item.hexcode) }}
          style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
          resizeMode="contain"
        />
      ) : (
        <AppText style={{ fontSize: 28 }}>{item.emoji}</AppText>
      )}
    </TouchableOpacity>
  );

  const renderCategoryTabs = () => (
    <View className="border-b border-gray-100 dark:border-gray-800">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}
        className="custom-scrollbar"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                setActiveCategory(cat.id);
                setSearchQuery("");
              }}
              className={classNames(
                "mr-2 px-3 py-1.5 rounded-full flex-row items-center",
                isActive
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <Ionicons
                name={cat.icon}
                size={18}
                color={isActive ? (isDark ? "#60A5FA" : "#2563EB") : isDark ? "#9CA3AF" : "#6B7280"}
              />
              <AppText
                className={classNames(
                  "ml-1.5 text-xs font-medium",
                  isActive ? "text-blue-600 dark:text-blue-300" : "text-gray-500 dark:text-gray-400"
                )}
              >
                {cat.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const getPopoverStyle = () => {
    if (!PLATFORM.IS_WEB) return {};
    const defaultPosition = { position: "absolute" as const, bottom: 60, right: 20 };
    if (!anchorPosition) return defaultPosition;
    return { position: "absolute" as const, ...anchorPosition };
  };

  if (PLATFORM.IS_WEB) {
    return visible ? (
      <View className="fixed inset-0 z-50" style={{ pointerEvents: visible ? "auto" : "none" }}>
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />
        <View
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden max-h-[80vh]"
          style={[getPopoverStyle(), { width: 400, height: 500 }]}
        >
          <View className="flex-row justify-between items-center p-3 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-base font-semibold dark:text-white">Select Emoji</AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
            />
          </View>

          {renderCategoryTabs()}

          <FlatList
            data={filteredEmojis}
            numColumns={NUM_COLUMNS}
            keyExtractor={(item) => item.hexcode}
            renderItem={renderEmojiItem}
            contentContainerStyle={{ padding: 8 }}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={5}
            className="custom-scrollbar"
            ListEmptyComponent={
              <View className="p-4 items-center">
                <AppText className="text-gray-400">No emojis found</AppText>
              </View>
            }
          />
        </View>
      </View>
    ) : null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className={classNames("flex-1 bg-black/50", { "justify-end": !PLATFORM.IS_WEB })}>
        <View
          className={classNames("bg-white dark:bg-gray-900 overflow-hidden shadow-xl", {
            "h-[75%] w-full rounded-t-[20px]": !PLATFORM.IS_WEB,
          })}
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-lg font-semibold dark:text-white">Select Emoji</AppText>
            <TouchableOpacity
              onPress={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
            />
          </View>

          {renderCategoryTabs()}

          <FlatList
            data={filteredEmojis}
            numColumns={6}
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
    </Modal>
  );
};
