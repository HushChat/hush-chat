import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native";
import { AppText } from "@/components/AppText";
import { useGifPicker } from "@/hooks/useGifPicker";
import {
  GifPickerFooter,
  GifPickerHeader,
  GifPickerSearch,
  LoadingView,
} from "@/components/conversation-input/GifPickerHelperUi";
import { GifPickerProps } from "@/types/chat/types";

export const GifPickerComponent: React.FC<GifPickerProps> = (props) => {
  const { visible } = props;
  const {
    searchQuery,
    setSearchQuery,
    gifs,
    isLoading,
    isFetchingNextPage,
    loadMore,
    handleClose,
    handleSelect,
  } = useGifPicker(props);

  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    const updateColumns = () => {
      const { width } = Dimensions.get("window");
      setNumColumns(width >= 600 ? 3 : 2);
    };
    updateColumns();
    const sub = Dimensions.addEventListener("change", updateColumns);
    return () => sub?.remove();
  }, []);

  const renderGifItem = ({ item }: { item: any }) => {
    const gifUrl = item.media_formats?.gif?.url || item.media?.[0]?.gif?.url;
    const tinygifUrl = item.media_formats?.tinygif?.url || item.media?.[0]?.tinygif?.url;
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

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-900 rounded-tl-[20px] rounded-tr-[20px] h-[80%]">
          <GifPickerHeader onClose={handleClose} />
          <GifPickerSearch value={searchQuery} onChange={setSearchQuery} />

          {isLoading ? (
            <LoadingView />
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
              ListFooterComponent={
                isFetchingNextPage ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color="#9CA3AF" />
                  </View>
                ) : null
              }
            />
          )}

          <GifPickerFooter />
        </View>
      </View>
    </Modal>
  );
};
