import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import FastImage from "react-native-fast-image";
import { searchTenorGifs, getTrendingGifs } from "@/services/gifService";
import { logError } from "@/utils/logger";
import { AppText, AppTextInput } from "@/components/AppText";

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
      logError("error searching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.title}>Select GIF</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <AppTextInput
              style={styles.searchInput}
              placeholder="Search GIFs..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
            </View>
          ) : (
            <FlatList
              data={gifs}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.gifItem}
                  onPress={() => {
                    onGifSelect(item.media[0].gif.url);
                    onClose();
                  }}
                >
                  <FastImage
                    source={{ uri: item.media[0].tinygif.url }}
                    style={styles.gif}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.gifList}
            />
          )}

          <View style={styles.footer}>
            <AppText style={styles.poweredBy}>Powered by Tenor</AppText>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: "#666",
  },
  searchContainer: {
    padding: 12,
  },
  searchInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gifList: {
    padding: 8,
  },
  gifItem: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
  },
  gif: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  footer: {
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  poweredBy: {
    fontSize: 12,
    color: "#666",
  },
});
