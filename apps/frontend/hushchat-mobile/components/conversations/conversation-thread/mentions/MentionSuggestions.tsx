import React, { useMemo } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import classNames from "classnames";
import { ConversationParticipant } from "@/types/chat/types";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { useConversationParticipantQuery } from "@/query/useConversationParticipantQuery";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import useDebounce from "@/hooks/useDebounce";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PLATFORM } from "@/constants/platformConstants";
import { useUserStore } from "@/store/user/useUserStore";

const COLORS = {
  lightBg: "#fafafa",
  darkBg: "#090f1d",
  borderLight: "#E5E7EB",
  borderDark: "#1f2937",
  shadow: "#000000",
};

type MentionSuggestionsProps = {
  conversationId: number;
  mentionQuery: string | null;
  onSelect: (participant: ConversationParticipant) => void;
};

const DEBOUNCE_DELAY_MS = 250;
const ALL_PARTICIPANT_ID = -999;

const MentionSuggestions = ({
  onSelect,
  conversationId,
  mentionQuery,
}: MentionSuggestionsProps) => {
  const { isDark } = useAppTheme();

  const debouncedKeyword = useDebounce(mentionQuery ?? "", DEBOUNCE_DELAY_MS);

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversationParticipantQuery(conversationId, debouncedKeyword);

  const { user } = useUserStore();
  const currentUserId = user?.id;

  const allOptionItem = useMemo(() => {
    return {
      id: ALL_PARTICIPANT_ID,
      user: {
        id: ALL_PARTICIPANT_ID,
        username: "all",
        firstName: "notifies all",
        lastName: "participants",
        signedImageUrl: null,
      },
    } as unknown as ConversationParticipant;
  }, []);

  const dataToRender = useMemo(() => {
    let list: ConversationParticipant[] = [];

    if (pages?.pages) {
      list = pages.pages.flatMap((p) => p?.content ?? []) as ConversationParticipant[];
      list = list.filter((p) => p.user.id !== currentUserId);
    }

    const queryLower = (debouncedKeyword || "").toLowerCase();
    const shouldShowAll = "all".startsWith(queryLower);

    if (shouldShowAll) {
      return [allOptionItem, ...list];
    }

    return list;
  }, [pages, currentUserId, debouncedKeyword, allOptionItem]);

  const { activeIndex, setActiveIndex } = useKeyboardNavigation({
    items: dataToRender,
    onSelect,
    enabled: true,
  });

  const renderItem = ({ item, index }: ListRenderItemInfo<ConversationParticipant>) => {
    const isActive = index === activeIndex;
    const isAllOption = item.id === ALL_PARTICIPANT_ID;
    const fullName =
      `${item.user.firstName ?? ""} ${item.user.lastName ?? ""}`.trim() || `@${item.user.username}`;

    return (
      <Pressable
        onPress={() => onSelect(item)}
        {...(PLATFORM.IS_WEB ? { onHoverIn: () => setActiveIndex(index) } : {})}
        className={classNames(
          "px-3 py-2 flex-row items-center",
          isActive ? "bg-primary-light/10 dark:bg-white/10" : "bg-transparent"
        )}
      >
        <View className="mr-3">
          {isAllOption ? (
            <View className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded-md items-center justify-center border border-dashed border-gray-400 dark:border-gray-500">
              <Text className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                @all
              </Text>
            </View>
          ) : (
            <InitialsAvatar
              name={fullName}
              size={AvatarSize.small}
              imageUrl={item.user.signedImageUrl}
            />
          )}
        </View>

        <View className="flex-1">
          {isAllOption ? (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              notifies all participants
            </Text>
          ) : (
            <>
              <Text className="text-sm text-text-primary-light dark:text-text-primary-dark">
                {fullName}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                @{item.user.username}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    );
  };

  if (isLoading && !dataToRender.length) {
    return (
      <View className="absolute bottom-24 left-3 z-50 w-[320px] max-w-[80%]">
        <View
          className={classNames(
            "rounded-lg custom-scrollbar py-2 items-center",
            "bg-background-light dark:bg-background-dark"
          )}
        >
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  if (dataToRender.length === 0) return null;

  return (
    <View className="absolute bottom-20 left-3 z-50 w-[250px] max-w-[80%]">
      <View
        style={[
          styles.listContainer,
          isDark && styles.listContainerDark,
          isDark ? styles.listContainerWithBorderDark : styles.listContainerWithBorderLight,
        ]}
      >
        <FlatList
          data={dataToRender}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          style={styles.listMaxHeight}
          keyboardShouldPersistTaps="handled"
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.6}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-2 items-center">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
};

export default MentionSuggestions;

const styles = StyleSheet.create({
  listContainer: {
    borderRadius: 8,
    backgroundColor: COLORS.lightBg,
    overflow: "hidden",
  },
  listContainerDark: {
    backgroundColor: COLORS.darkBg,
  },
  listContainerWithBorderLight: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  listContainerWithBorderDark: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  listMaxHeight: {
    maxHeight: 300,
  },
});
