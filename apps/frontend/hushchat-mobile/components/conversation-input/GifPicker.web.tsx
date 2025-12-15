import React, { useState, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import useGetTrendingGifsQuery from "@/query/useGetTrendingGifsQuery";
import useSearchGifsQuery from "@/query/useSearchGifsQuery";
import useDebounce from "@/hooks/useDebounce";
import { useAuthThemeColors } from "@/hooks/useAuthThemeColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
}

const SEARCH_DEBOUNCE_MS = 500;

export const GifPickerComponent: React.FC<Props> = ({ visible, onClose, onGifSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);
  const { isDark } = useAuthThemeColors();

  const trendingQuery = useGetTrendingGifsQuery();
  const searchQueryObj = useSearchGifsQuery(debouncedSearch);
  const isSearching = debouncedSearch.trim().length > 0;
  const activeQuery = isSearching ? searchQueryObj : trendingQuery;

  const flatGifs = useMemo(() => {
    if (!activeQuery.data || !activeQuery.data.pages) return [];
    return activeQuery.data.pages.flatMap((page: any) => page.results || []);
  }, [activeQuery.data]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        className="fixed inset-0 z-[999] bg-black/50"
        onPress={handleClose}
      />

      <View className="fixed top-1/2 left-1/2 z-[1000] w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg">
        <View className="flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
          <AppText className="text-lg font-semibold dark:text-white">Select GIF</AppText>
          <TouchableOpacity
            onPress={handleClose}
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
            className="rounded-[20px] bg-gray-100 dark:bg-gray-800 p-3 text-base dark:text-white"
            placeholder="Search GIFs..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          className="max-h-[calc(80vh-180px)] custom-scrollbar"
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View className="flex-row flex-wrap p-3">
            {activeQuery.isLoading ? (
              <View className="w-full p-10 items-center">
                <ActivityIndicator size="large" color="#9CA3AF" />
              </View>
            ) : flatGifs.length === 0 ? (
              <View className="w-full p-10 items-center">
                <AppText className="dark:text-gray-400">No GIFs found</AppText>
              </View>
            ) : (
              flatGifs.map((gif: any, index: number) => {
                const gifUrl = gif.media_formats?.gif?.url || gif.media?.[0]?.gif?.url;
                const tinygifUrl = gif.media_formats?.tinygif?.url || gif.media?.[0]?.tinygif?.url;

                const key = `${gif.id}-${index}`;

                if (!gifUrl || !tinygifUrl) {
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      onGifSelect(gifUrl);
                      handleClose();
                    }}
                    className="w-1/3 aspect-square p-1"
                  >
                    <Image
                      source={{ uri: tinygifUrl }}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                );
              })
            )}

            {activeQuery.isFetchingNextPage && (
              <View className="w-full p-4 items-center">
                <ActivityIndicator size="small" color="#9CA3AF" />
              </View>
            )}
          </View>
        </ScrollView>

        <View className="items-center border-t border-gray-200 dark:border-gray-800 p-3">
          <AppText className="text-xs text-gray-500 dark:text-gray-400">Powered by Tenor</AppText>
        </View>
      </View>
    </>
  );
};
