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
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    if (visible) {
      loadTrendingGifs();
    }
  }, [visible]);

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

  const renderGifItem = ({ item }: { item: any }) => {
    const gifUrl = item.media_formats?.gif?.url || item.media?.[0]?.gif?.url;
    const tinygifUrl = item.media_formats?.tinygif?.url || item.media?.[0]?.tinygif?.url;

    if (!gifUrl || !tinygifUrl) {
      logWarn("Invalid GIF data:", item);
      return null;
    }

    return (
      <TouchableOpacity
        className="flex-1 m-1 aspect-square"
        onPress={() => {
          onGifSelect(gifUrl);
          onClose();
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
      <AppText className="text-sm text-[#666666]">No GIFs found</AppText>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-tl-[20px] rounded-tr-[20px] h-[80%]">
          <View className="flex-row justify-between items-center p-4 border-b border-[#e0e0e0]">
            <AppText className="text-lg font-semibold">Select GIF</AppText>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full">
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <View className="p-3">
            <AppTextInput
              className="bg-[#f0f0f0] rounded-[20px] p-3 text-base"
              placeholder="Search GIFs..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>

          {loading ? (
            <View className="flex-1 justify-center items-center p-10">
              <ActivityIndicator size="large" color="#666666" />
            </View>
          ) : (
            <FlatList
              data={gifs}
              numColumns={numColumns}
              key={numColumns} // Force re-render when columns change
              keyExtractor={(item) => item.id}
              renderItem={renderGifItem}
              contentContainerStyle={{ padding: 8, flexGrow: 1 }}
              ListEmptyComponent={renderEmptyComponent}
            />
          )}

          <View className="p-3 items-center border-t border-[#e0e0e0]">
            <AppText className="text-xs text-[#666666]">Powered by Tenor</AppText>
          </View>
        </View>
      </View>
    </Modal>
  );
};
