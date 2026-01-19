import React from "react";
import { View, FlatList, TouchableOpacity, useWindowDimensions, Image } from "react-native";
import { AppText } from "@/components/AppText";
import { useGifPicker } from "@/hooks/useGifPicker";
import {
  GifPickerFooter,
  GifPickerHeader,
  GifPickerSearch,
} from "@/components/conversation-input/GifPickerHelperUi";
import { GifPickerProps } from "@/types/chat/types";
import { TenorGif } from "@/services/gifService";
import LoadingState from "@/components/LoadingState";

export const GifPickerMobile = ({ visible, onClose, onGifSelect }: GifPickerProps) => {
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 3 : 2;

  const {
    searchQuery,
    setSearchQuery,
    gifs,
    isLoading,
    isFetchingNextPage,
    loadMore,
    handleClose,
    handleSelect,
  } = useGifPicker({ onClose, onGifSelect });

  const renderGifItem = ({ item }: { item: TenorGif }) => {
    const gifUrl = item.media_formats?.gif?.url;
    const tinygifUrl = item.media_formats?.tinygif?.url;
    if (!gifUrl || !tinygifUrl) return null;

    return (
      <TouchableOpacity className="flex-1 m-1 aspect-square" onPress={() => handleSelect(gifUrl)}>
        <Image
          source={{ uri: tinygifUrl }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <View className="h-[400px]">
        <GifPickerHeader onClose={handleClose} />
        <GifPickerSearch value={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <LoadingState />
        ) : (
          <FlatList
            data={gifs}
            numColumns={numColumns}
            key={numColumns}
            keyExtractor={(item) => item.id}
            renderItem={renderGifItem}
            contentContainerStyle={{ padding: 8, flexGrow: 1 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center p-10">
                <AppText className="text-sm text-gray-500 dark:text-gray-400">
                  No GIFs found
                </AppText>
              </View>
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <LoadingState /> : null}
          />
        )}

        <GifPickerFooter />
      </View>
    </View>
  );
};
