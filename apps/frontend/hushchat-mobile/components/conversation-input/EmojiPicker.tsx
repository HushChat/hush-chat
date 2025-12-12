import React, { useState, useMemo } from "react";
import { Modal, View, TouchableOpacity, StyleSheet, FlatList, Platform } from "react-native";
import emojiData from "openmoji/data/openmoji.json";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText, AppTextInput } from "@/components/AppText";

interface Props {
  visible: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerComponent: React.FC<Props> = ({ visible, onClose, onEmojiSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmojis = useMemo(() => {
    if (searchQuery === "") return emojiData;

    const query = searchQuery.toLowerCase();
    return emojiData.filter(
      (emoji: any) =>
        emoji.annotation?.toLowerCase().includes(query) || emoji.tags?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const renderEmojiItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.emojiItem}
      onPress={() => {
        onEmojiSelect(item.emoji);
        onClose();
      }}
    >
      <AppText style={styles.emoji}>{item.emoji}</AppText>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <AppText style={styles.title}>Select Emoji</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppText style={styles.closeText}>✕</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <AppTextInput
              style={styles.searchInput}
              placeholder="Search emojis..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredEmojis}
            numColumns={PLATFORM.IS_WEB ? 8 : 6}
            keyExtractor={(item: any) => item.hexcode}
            renderItem={renderEmojiItem}
            contentContainerStyle={styles.emojiList}
            initialNumToRender={50}
            maxToRenderPerBatch={50}
            windowSize={5}
          />
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
    height: PLATFORM.IS_WEB ? 500 : "70%",
    ...Platform.select({
      web: {
        maxWidth: 450,
        alignSelf: "center",
        width: "100%",
        borderRadius: 12,
        marginBottom: 20,
      },
    }),
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
    ...Platform.select({
      web: {
        outlineWidth: 0,
      },
    }),
  },
  emojiList: {
    padding: 8,
  },
  emojiItem: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
    margin: 2,
  },
  emoji: {
    fontSize: 32,
  },
});
