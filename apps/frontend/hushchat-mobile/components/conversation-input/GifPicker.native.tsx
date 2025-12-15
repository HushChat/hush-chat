import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import useGetTrendingGifsQuery from "@/query/useGetTrendingGifsQuery";
import useSearchGifsQuery from "@/query/useSearchGifsQuery";
import useDebounce from "@/hooks/useDebounce";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
}

const SEARCH_DEBOUNCE_MS = 500;

export const GifPickerComponent: React.FC<Props> = ({ visible, onClose, onGifSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [numColumns, setNumColumns] = useState(2);

  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    const updateColumns = () => {
      const { width } = Dimensions.get("window");
      if (width >= 768) {
        setNumColumns(3);
      } else if (width >= 600) {
        setNumColumns(3);
      } else {
        setNumColumns(2);
      }
    };

    updateColumns();
    const subscription = Dimensions.addEventListener("change", updateColumns);

    return () => {
      subscription?.remove();
    };
  }, []);

  const isSearching = debouncedSearch.trim().length > 0;
  const trendingQuery = useGetTrendingGifsQuery();
  const searchQueryObj = useSearchGifsQuery(debouncedSearch);
  const activeQuery = isSearching ? searchQueryObj : trendingQuery;

  const flatGifs = useMemo(() => {
    if (!activeQuery.data || !activeQuery.data.pages) return [];
    return activeQuery.data.pages.flatMap((page: any) => page.results || []);
  }, [activeQuery.data]);

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const loadMore = () => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  };

  const renderGifItem = ({ item }: { item: any }) => {
    const gifUrl = item.media_formats?.gif?.url || item.media?.[0]?.gif?.url;
    const tinygifUrl = item.media_formats?.tinygif?.url || item.media?.[0]?.tinygif?.url;

    if (!gifUrl || !tinygifUrl) {
      return null;
    }

    return (
      <TouchableOpacity
        className="flex-1 m-1 aspect-square"
        onPress={() => {
          onGifSelect(gifUrl);
          handleClose();
        }}
      >
        <Image
          source={{ uri: tinygifUrl }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center p-10">
      <AppText className="text-sm text-gray-500 dark:text-gray-400">No GIFs found</AppText>
    </View>
  );

  const renderFooter = () => {
    if (!activeQuery.isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#9CA3AF" />
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-900 rounded-tl-[20px] rounded-tr-[20px] h-[80%]">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <AppText className="text-lg font-semibold dark:text-white">Select GIF</AppText>
            <TouchableOpacity
              onPress={handleClose}
              className="p-2 rounded-full active:bg-gray-200 dark:active:bg-gray-800"
            >
              <Ionicons name="close" size={24} className="text-gray-500 dark:text-gray-400" />
            </TouchableOpacity>
          </View>

          <View className="p-3">
            <AppTextInput
              className="bg-gray-100 dark:bg-gray-800 rounded-[20px] p-3 text-base dark:text-white"
              placeholder="Search GIFs..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {activeQuery.isLoading ? (
            <View className="flex-1 justify-center items-center p-10">
              <ActivityIndicator size="large" color="#9CA3AF" />
            </View>
          ) : (
            <FlatList
              data={flatGifs}
              numColumns={numColumns}
              key={numColumns}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderGifItem}
              contentContainerStyle={{ padding: 8, flexGrow: 1 }}
              ListEmptyComponent={renderEmptyComponent}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}

          <View className="p-3 items-center border-t border-gray-200 dark:border-gray-800">
            <AppText className="text-xs text-gray-500 dark:text-gray-400">Powered by Tenor</AppText>
          </View>
        </View>
      </View>
    </Modal>
  );
};
