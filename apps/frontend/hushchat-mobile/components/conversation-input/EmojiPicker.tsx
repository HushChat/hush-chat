import React, { useState, useMemo, memo } from "react";
import { Modal, View, TouchableOpacity, FlatList, ScrollView } from "react-native";
import { Image as ExpoImage } from "expo-image";
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

const CATEGORIES = [
  { id: "smileys-emotion", icon: "happy-outline", label: "Smileys" },
  { id: "people-body", icon: "body-outline", label: "People" },
  { id: "animals-nature", icon: "paw-outline", label: "Nature" },
  { id: "food-drink", icon: "fast-food-outline", label: "Food" },
  { id: "travel-places", icon: "airplane-outline", label: "Travel" },
  { id: "activities", icon: "basketball-outline", label: "Activities" },
  { id: "objects", icon: "bulb-outline", label: "Objects" },
  { id: "symbols", icon: "heart-outline", label: "Symbols" },
  { id: "flags", icon: "flag-outline", label: "Flags" },
];

const EmojiItemRender = memo(
  function EmojiItemRender({
    item,
    onSelect,
  }: {
    item: EmojiItem;
    onSelect: (item: EmojiItem) => void;
  }) {
    const imageUrl = `${EMOJI_BASE_URL}${item.hexcode}.png`;

    return (
      <TouchableOpacity
        className="flex-1 aspect-square justify-center items-center p-2 m-0.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
        onPress={() => onSelect(item)}
      >
        <ExpoImage
          source={imageUrl}
          style={{ width: EMOJI_SIZE, height: EMOJI_SIZE }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={200}
        />
      </TouchableOpacity>
    );
  },
  (prev, next) => prev.item.hexcode === next.item.hexcode
);

export const EmojiPickerComponent: React.FC<IEmojiPickerProps> = ({
  visible,
  onClose,
  onEmojiSelect,
  anchorPosition,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const { isDark } = useAppTheme();

  const typedEmojiData = emojiData as EmojiItem[];

  const emojisByCategory = useMemo(() => {
    const groups: Record<string, EmojiItem[]> = {};

    CATEGORIES.forEach((cat) => (groups[cat.id] = []));

    typedEmojiData.forEach((emoji) => {
      if (emoji.group && groups[emoji.group]) {
        groups[emoji.group].push(emoji);
      }
    });
    return groups;
  }, []);

  const currentDisplayData = useMemo(() => {
    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      return typedEmojiData.filter(
        (emoji) =>
          emoji.annotation?.toLowerCase().includes(query) ||
          emoji.tags?.toLowerCase().includes(query)
      );
    }

    return emojisByCategory[activeCategory] || [];
  }, [searchQuery, activeCategory, emojisByCategory]);

  const handleEmojiSelect = (emoji: EmojiItem) => {
    onEmojiSelect(emoji.emoji);
    setSearchQuery("");
  };

  const renderEmojiItem = ({ item }: { item: EmojiItem }) => (
    <EmojiItemRender item={item} onSelect={handleEmojiSelect} />
  );

  const renderCategoryTabs = () => {
    if (searchQuery.length > 0) return null;

    return (
      <View className="h-12 border-b border-gray-200 dark:border-gray-800">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 8, alignItems: "center" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                className={classNames("mr-2 px-3 py-2 rounded-full flex-row items-center", {
                  "bg-blue-100 dark:bg-blue-900/40": isActive,
                  "bg-transparent": !isActive,
                })}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={
                    isActive ? (isDark ? "#60A5FA" : "#2563EB") : isDark ? "#9CA3AF" : "#6B7280"
                  }
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const getPopoverStyle = () => {
    if (!PLATFORM.IS_WEB) return {};
    const defaultPosition = { position: "absolute" as const, bottom: 60, right: 20 };
    if (!anchorPosition) return defaultPosition;
    return { position: "absolute" as const, ...anchorPosition };
  };

  const contentClass = "bg-white dark:bg-gray-900 overflow-hidden shadow-xl flex-1";

  const renderPickerContent = () => (
    <>
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
        <AppText className="text-lg font-semibold dark:text-white">
          {searchQuery
            ? "Search Results"
            : CATEGORIES.find((c) => c.id === activeCategory)?.label || "Select Emoji"}
        </AppText>
        <TouchableOpacity
          onPress={onClose}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Ionicons name="close" size={24} color={isDark ? "#FAFAF9" : "#050506"} />
        </TouchableOpacity>
      </View>

      <View className="p-3">
        <AppTextInput
          className="bg-gray-100 dark:bg-gray-800 rounded-[20px] p-3 text-base dark:text-white"
          style={{ outlineWidth: 0 }}
          placeholder="Search emojis..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {renderCategoryTabs()}

      <FlatList
        data={currentDisplayData}
        numColumns={PLATFORM.IS_WEB ? 8 : 6}
        keyExtractor={(item) => item.hexcode}
        renderItem={renderEmojiItem}
        contentContainerStyle={{ padding: 8 }}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={5}
        removeClippedSubviews={true}
        className="custom-scrollbar"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-10">
            <AppText className="text-gray-400">No emojis found</AppText>
          </View>
        }
      />
    </>
  );

  if (PLATFORM.IS_WEB) {
    return visible ? (
      <View className="fixed inset-0 z-50" style={{ pointerEvents: visible ? "auto" : "none" }}>
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />
        <View
          className={`rounded-xl border border-gray-200 dark:border-gray-800 ${contentClass}`}
          style={[getPopoverStyle(), { width: 400, height: 500 }]}
        >
          {renderPickerContent()}
        </View>
      </View>
    ) : null;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className={classNames("flex-1 bg-black/50", { "justify-end": !PLATFORM.IS_WEB })}>
        <View
          className={classNames(contentClass, {
            "h-[75%] w-full rounded-t-[20px]": !PLATFORM.IS_WEB,
          })}
        >
          {renderPickerContent()}
        </View>
      </View>
    </Modal>
  );
};
