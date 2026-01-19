import { View, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import FilterButton from "@/components/FilterButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  CHAT_VIEW_PATH,
  GROUP_CONVERSATION_SELECT_PARTICIPANTS,
  MENTIONED_MESSAGES,
  SETTINGS_CONTACT,
  SETTINGS_INVITE,
  SETTINGS_WORKSPACE,
} from "@/constants/routes";
import classNames from "classnames";
import BackButton from "@/components/BackButton";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import SearchBar from "@/components/SearchBar";
import { ChatComponentProps, ConversationType } from "@/types/chat/types";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";
import { useUserWorkspacesQuery } from "@/query/useUserWorkspacesQuery";
import { AppText } from "@/components/AppText";
import { SoundToggleButton } from "@/components/conversations/SoundToggleButton";
import { useConversationHeaderTitle } from "@/hooks/useConversationHeaderTitle";

export default function ChatInterfaceMobile({
  chatItemList,
  filters,
  selectedConversation,
  setSelectedConversation,
  onSearchQueryInserting = () => {},
  searchQuery = "",
}: ChatComponentProps) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);
  const { selectedConversationType, setSelectedConversationType } = useConversationStore();
  const { workspaces } = useUserWorkspacesQuery();

  const headerTitle = useConversationHeaderTitle(selectedConversationType);

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

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center">
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
