import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { AppText } from "@/components/AppText";
import { useGifPicker } from "@/hooks/useGifPicker";
import {
  GifPickerFooter,
  GifPickerHeader,
  GifPickerSearch,
} from "@/components/conversation-input/GifPickerHelperUi";
import { GifPickerProps } from "@/types/chat/types";
import LoadingState from "@/components/LoadingState";

export const GifPickerComponent: React.FC<GifPickerProps> = (props) => {
  const { visible } = props;
  const {
    searchQuery,
    setSearchQuery,
    gifs,
    isLoading,
    isFetchingNextPage,
    isEmpty,
    loadMore,
    handleClose,
    handleSelect,
  } = useGifPicker(props);

  if (!visible) return null;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      loadMore();
    }
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        className="fixed inset-0 z-[999] bg-black/50"
        onPress={handleClose}
      />

      <View className="fixed top-1/2 left-1/2 z-[1000] w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-lg">
        <GifPickerHeader onClose={handleClose} />
        <GifPickerSearch value={searchQuery} onChange={setSearchQuery} />

        <ScrollView
          className="max-h-[calc(80vh-180px)] custom-scrollbar"
          contentContainerStyle={{ flexGrow: 1 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View className="flex-row flex-wrap p-3">
            {isLoading ? (
              <LoadingState />
            ) : isEmpty ? (
              <View className="w-full p-10 items-center">
                <AppText className="dark:text-gray-400">No GIFs found</AppText>
              </View>
            ) : (
              gifs.map((gif: any, index: number) => {
                const gifUrl = gif.media_formats?.gif?.url || gif.media?.[0]?.gif?.url;
                const tinygifUrl = gif.media_formats?.tinygif?.url || gif.media?.[0]?.tinygif?.url;
                if (!gifUrl || !tinygifUrl) return null;

                return (
                  <TouchableOpacity
                    key={`${gif.id}-${index}`}
                    onPress={() => handleSelect(gifUrl)}
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

            {isFetchingNextPage && (
              <View className="w-full p-4 items-center">
                <ActivityIndicator size="small" color="#9CA3AF" />
              </View>
            )}
          </View>
        </ScrollView>

        <GifPickerFooter />
      </View>
    </>
  );
};
