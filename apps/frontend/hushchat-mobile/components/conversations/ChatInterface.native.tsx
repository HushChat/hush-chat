import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import FilterButton from "@/components/FilterButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";
import classNames from "classnames";
import BackButton from "@/components/BackButton";
import BottomSheet from "@/components/BottomSheet";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import SearchBar from "@/components/SearchBar";
import { ChatComponentProps, ConversationType } from "@/types/chat/types";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";

export default function ChatInterface({
  chatItemList,
  filters,
  selectedConversation,
  setSelectedConversation,
  onSearchQueryInserting = () => {},
  searchQuery = "",
}: ChatComponentProps) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const { selectedConversationType, setSelectedConversationType } =
    useConversationStore();

  useEffect(() => {
    if (selectedConversation) {
      router.push({
        pathname: CHAT_VIEW_PATH,
        params: {
          conversationId: selectedConversation.id,
        },
      });

      setSelectedConversation(null);
    }
  }, [selectedConversation, setSelectedConversation]);

  const sheetOptions = [
    {
      id: "create-group",
      title: "New group",
      icon: "people-outline" as const,
      onPress: () => {
        setSheetVisible(false);
        router.push("/group-conversation/select-participants");
      },
    },
  ];

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center">
          {selectedConversationType === ConversationType.ARCHIVED && (
            <BackButton
              onPress={() => setSelectedConversationType(ConversationType.ALL)}
            />
          )}

          <View className="flex-1">
            <Text
              className={classNames(
                "text-text-primary-light dark:text-text-primary-dark",
                {
                  "text-xl font-medium":
                    selectedConversationType === ConversationType.ARCHIVED,
                  "text-3xl font-bold":
                    selectedConversationType !== ConversationType.ARCHIVED,
                },
              )}
            >
              {selectedConversationType === ConversationType.ARCHIVED
                ? "Archived"
                : "Chats"}
            </Text>
          </View>

          <WebSocketStatusIndicator />

          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            className="ml-2 h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      {selectedConversationType === ConversationType.ALL && (
        <View className="px-4 h-12">
          <SearchBar
            value={searchQuery}
            onChangeText={onSearchQueryInserting}
            onClear={() => onSearchQueryInserting("")}
          />
        </View>
      )}

      {selectedConversationType !== ConversationType.ARCHIVED && (
        <View className="bg-background-light dark:bg-background-dark px-4 py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-x-2">
              {filters.map((filter) => (
                <FilterButton
                  key={filter.key}
                  label={filter.label}
                  isActive={filter.isActive}
                  onPress={() => setSelectedConversationType(filter.key)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {chatItemList}

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        options={sheetOptions}
        title="Actions"
      />
    </View>
  );
}
