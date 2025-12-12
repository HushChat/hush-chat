import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Image, ScrollView, ActivityIndicator } from "react-native";
import { searchTenorGifs, getTrendingGifs } from "@/services/gifService";
import { logError, logWarn } from "@/utils/logger";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
}

export const GifPickerComponent: React.FC<Props> = ({ visible, onClose, onGifSelect }) => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (visible) {
      loadTrendingGifs();
    }
  }, [visible]);

  const loadTrendingGifs = async () => {
    setLoading(true);
    try {
      const results = await getTrendingGifs();
      setGifs(results);
    } catch (error) {
      logError("error loading GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      loadTrendingGifs();
      return;
    }

    setLoading(true);
    try {
      const results = await searchTenorGifs(query);
      setGifs(results);
    } catch (error) {
      logError("Error searching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={1}
        className="fixed inset-0 z-[999] bg-black/50"
        onPress={onClose}
      />

      <View className="fixed top-1/2 left-1/2 z-[1000] w-[600px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl bg-white shadow-lg">
        <View className="flex-row items-center justify-between border-b border-[#e0e0e0] p-4">
          <AppText className="text-lg font-semibold">Select GIF</AppText>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="close" size={24} color="#666666" />
          </TouchableOpacity>
        </View>

        <View className="p-3">
          <AppTextInput
            className="rounded-[20px] bg-[#f0f0f0] p-3 text-base"
            placeholder="Search GIFs..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <ScrollView className="max-h-[calc(80vh-180px)]" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-row flex-wrap p-3">
            {loading ? (
              <View className="w-full p-10 items-center">
                <ActivityIndicator size="large" color="#666666" />
              </View>
            ) : gifs.length === 0 ? (
              <View className="w-full p-10 items-center">
                <AppText>No GIFs found</AppText>
              </View>
            ) : (
              gifs.map((gif) => {
                const gifUrl = gif.media_formats?.gif?.url || gif.media?.[0]?.gif?.url;
                const tinygifUrl = gif.media_formats?.tinygif?.url || gif.media?.[0]?.tinygif?.url;

                if (!gifUrl || !tinygifUrl) {
                  logWarn("Invalid GIF data:", gif);
                  return null;
                }

                return (
                  <TouchableOpacity
                    key={gif.id}
                    onPress={() => {
                      onGifSelect(gifUrl);
                      onClose();
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
          </View>
        </ScrollView>

        <View className="items-center border-t border-[#e0e0e0] p-3">
          <AppText className="text-xs text-[#666666]">Powered by Tenor</AppText>
        </View>
      </View>
    </>
  );
};
