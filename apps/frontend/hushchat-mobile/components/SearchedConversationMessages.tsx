import React, { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { debounce } from "lodash";

import { PLATFORM } from "@/constants/platformConstants";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { router } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";

import useConversationMessagesSearchQuery from "@/query/useConversationMessagesSearchQuery";
import BackButton from "@/components/BackButton";
import SearchBar from "@/components/SearchBar";
import { SearchedMessagesList } from "@/components/conversations/conversation-thread/message-list/SearchedMessagesList";

interface WebSearchedConversationMessages {
  conversationId?: number;
  conversationName?: string;
  onClose?: () => void;
  onMessageClicked?: (message: any) => void;
}

const SearchedConversationMessages: React.FC<WebSearchedConversationMessages> = ({
  conversationName,
  conversationId,
  onClose = () => {},
  onMessageClicked,
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 500),
    []
  );

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const {
    searchedMessages,
    isLoadingSearchedMessages,
    searchedMessagesError,
    refetchSearchedMessages,
  } = useConversationMessagesSearchQuery(Number(conversationId), searchQuery);

  const handleMessagePress = useCallback(
    (message: any) => {
      if (PLATFORM.IS_WEB) {
        onMessageClicked?.(message);
      } else {
        router.push({
          pathname: CHAT_VIEW_PATH,
          params: {
            conversationId,
            messageId: message.id,
          },
        });
      }
    },
    [conversationId, onMessageClicked]
  );

  const renderEmptyState = useCallback(() => {
    if (inputValue.length > 0 && searchQuery.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">Typing...</Text>
        </View>
      );
    }

    if (isLoadingSearchedMessages) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className="mt-2 text-gray-500">Searching...</Text>
        </View>
      );
    }

    if (searchQuery.length > 0 && searchedMessages.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-center text-gray-500">
            No messages found for &quot;{searchQuery}&quot;
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-center text-gray-500">Type to search for messages</Text>
      </View>
    );
  }, [inputValue.length, isLoadingSearchedMessages, searchQuery, searchedMessages.length]);

  const handleCancel = useCallback(() => {
    debouncedSearch.cancel();
    router.push({
      pathname: CHAT_VIEW_PATH,
      params: { conversationId },
    });
  }, [debouncedSearch, conversationId]);

  const handleSearchQueryClear = useCallback(() => {
    setInputValue("");
    setSearchQuery("");
  }, []);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-4 pb-2">
        <View className="flex-row items-center justify-between mb-4">
          {PLATFORM.IS_WEB && (
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              Search Messages
            </Text>
          )}

          {PLATFORM.IS_WEB && <BackButton onPress={onClose} />}

          {!PLATFORM.IS_WEB && (
            <View className="flex-row items-center flex-1 gap-2">
              <SearchBar
                onChangeText={handleSearchInputChange}
                value={inputValue}
                placeholder="Search messages..."
                onClear={handleSearchQueryClear}
              />

              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={DEFAULT_ACTIVE_OPACITY}
                className="px-3"
              >
                <Text className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {PLATFORM.IS_WEB && (
          <SearchBar
            onChangeText={handleSearchInputChange}
            value={inputValue}
            placeholder={`Search in ${conversationName || "conversation"}`}
            onClear={handleSearchQueryClear}
          />
        )}
      </View>

      <View className="flex-1">
        {searchedMessagesError ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500">Error loading results</Text>
            <TouchableOpacity onPress={() => refetchSearchedMessages()}>
              <Text className="text-blue-500 mt-2">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : searchedMessages.length > 0 ? (
          <SearchedMessagesList
            messages={searchedMessages}
            searchQuery={searchQuery}
            onMessagePress={handleMessagePress}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    </View>
  );
};

export default SearchedConversationMessages;
