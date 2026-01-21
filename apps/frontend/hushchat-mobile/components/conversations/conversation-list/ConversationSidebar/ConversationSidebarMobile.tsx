import React, { useCallback, useMemo, useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";

import { useConversationList } from "@/hooks/useConversationList";
import { useConversationSearch } from "@/hooks/useConversationSearch";
import { useUserActivity } from "@/hooks/useUserActivity";

import ConversationListContainer from "@/components/conversations/conversation-list/ConversationListContainer";
import BackButton from "@/components/BackButton";
import { AppText } from "@/components/AppText";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";
import { SoundToggleButton } from "@/components/conversations/SoundToggleButton";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";

import { ConversationType, IConversation, IFilter } from "@/types/chat/types";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { router } from "expo-router";
import {
  CHAT_VIEW_PATH,
  GROUP_CONVERSATION_SELECT_PARTICIPANTS,
  MENTIONED_MESSAGES,
  SETTINGS_CONTACT,
  SETTINGS_INVITE,
  SETTINGS_WORKSPACE,
} from "@/constants/routes";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import { useConversationHeaderTitle } from "@/hooks/useConversationHeaderTitle";

export default function ConversationSidebarMobile() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { workspaces } = useUserWorkspacesQuery();

  const {
    selectedConversationType,
    setSelectedConversationType,
    selectedConversationId,
    conversations,
    selectedConversation,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationList();

  const headerTitle = useConversationHeaderTitle(selectedConversationType);

  const {
    searchInput,
    searchResults,
    isSearching,
    searchError,
    refetchSearch,
    handleSearchInputChange,
    handleSearchClear,
  } = useConversationSearch();

  const sheetOptions = useMemo(() => {
    const options: BottomSheetOption[] = [
      {
        id: "create-group",
        title: "New group",
        icon: "people-outline",
        onPress: () => {
          setSheetVisible(false);
          router.push(GROUP_CONVERSATION_SELECT_PARTICIPANTS);
        },
      },
      {
        id: "mentioned-messages",
        title: "Mentioned messages",
        icon: "at-outline",
        onPress: () => {
          setSheetVisible(false);
          router.push(MENTIONED_MESSAGES);
        },
      },
      {
        id: "contact",
        title: "Contacts",
        icon: "chatbubble-outline",
        onPress: () => {
          setSheetVisible(false);
          router.push(SETTINGS_CONTACT);
        },
      },
      {
        id: "invite",
        title: "Invite",
        icon: "person-add",
        onPress: () => {
          setSheetVisible(false);
          router.push(SETTINGS_INVITE);
        },
      },
    ];

    if (workspaces && workspaces.length > 1) {
      options.push({
        id: "change-workspace",
        title: "Change workspace",
        icon: "aperture-outline",
        onPress: () => {
          setSheetVisible(false);
          router.push(SETTINGS_WORKSPACE);
        },
      });
    }

    return options;
  }, [workspaces]);

  const handleSelectConversation = useCallback((conversation: IConversation | null) => {
    if (!conversation) return;
    router.push({
      pathname: CHAT_VIEW_PATH,
      params: {
        conversationId: conversation.id,
      },
    });
  }, []);

  useUserActivity({ conversations, selectedConversationId });

  const filters: IFilter[] = [
    {
      key: ConversationType.ALL,
      label: "All",
      isActive: selectedConversationType === ConversationType.ALL,
    },
    {
      key: ConversationType.FAVORITES,
      label: "Favorites",
      isActive: selectedConversationType === ConversationType.FAVORITES,
    },
    {
      key: ConversationType.GROUPS,
      label: "Groups",
      isActive: selectedConversationType === ConversationType.GROUPS,
    },
    {
      key: ConversationType.MUTED,
      label: "Muted",
      isActive: selectedConversationType === ConversationType.MUTED,
    },
  ];

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center py-3">
          {selectedConversationType === ConversationType.ARCHIVED && (
            <BackButton onPress={() => setSelectedConversationType(ConversationType.ALL)} />
          )}

          <View className="flex-1">
            <AppText
              className={classNames("text-text-primary-light dark:text-text-primary-dark", {
                "text-xl font-medium": selectedConversationType === ConversationType.ARCHIVED,
                "text-3xl font-bold": selectedConversationType !== ConversationType.ARCHIVED,
              })}
            >
              {headerTitle}
            </AppText>
          </View>

          <WebSocketStatusIndicator />
          <SoundToggleButton />

          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            className="ml-2 h-9 w-9 items-center justify-center rounded-lg"
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {selectedConversationType === ConversationType.ALL && (
        <View className="px-4 h-12">
          <SearchBar
            value={searchInput}
            onChangeText={handleSearchInputChange}
            onClear={handleSearchClear}
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

      <View className="flex-1">
        <ConversationListContainer
          conversations={conversations}
          conversationsError={conversationsError?.message}
          conversationsLoading={isLoadingConversations}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          conversationsRefetch={refetch}
          setSelectedConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          searchedConversationsResult={searchResults}
          isSearchingConversations={isSearching}
          errorWhileSearchingConversation={searchError?.message}
          searchQuery={searchInput}
          refetchSearchResults={refetchSearch}
        />
      </View>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        options={sheetOptions}
        title="Actions"
      />
    </View>
  );
}
