import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { searchTenorGifs, getTrendingGifs } from "@/services/gifService";
import { logError, logWarn } from "@/utils/logger";
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
      console.error("Error searching GIFs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <TouchableOpacity
        style={{
          position: "fixed" as any,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 999,
        }}
        onPress={onClose}
      />

      <View
        style={{
          position: "fixed" as any,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxHeight: "auto",
          backgroundColor: "#fff",
          borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          zIndex: 1000,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: "600" }}>Select GIF</AppText>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <AppText style={{ fontSize: 24, color: "#666" }}>✕</AppText>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 12 }}>
          <AppTextInput
            style={{
              backgroundColor: "#f0f0f0",
              borderRadius: 20,
              padding: 12,
              fontSize: 16,
            }}
            placeholder="Search GIFs..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            padding: 12,
            overflowY: "auto",
            maxHeight: "calc(80vh - 180px)",
          }}
        >
          {loading ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>Loading...</div>
          ) : gifs.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 40 }}>
              No GIFs found
            </div>
          ) : (
            gifs.map((gif) => {
              const gifUrl = gif.media_formats?.gif?.url || gif.media?.[0]?.gif?.url;
              const tinygifUrl = gif.media_formats?.tinygif?.url || gif.media?.[0]?.tinygif?.url;

              if (!gifUrl || !tinygifUrl) {
                logWarn("Invalid GIF data:", gif);
                return null;
              }

              return (
                <div
                  key={gif.id}
                  onClick={() => {
                    onGifSelect(gifUrl);
                    onClose();
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: 8,
                    overflow: "hidden",
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src={tinygifUrl}
                    alt="gif"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              );
            })
          )}
        </div>

        <View
          style={{
            padding: 12,
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
          }}
        >
          <AppText style={{ fontSize: 12, color: "#666" }}>Powered by Tenor</AppText>
        </View>
      </View>
    </>
  );
};
