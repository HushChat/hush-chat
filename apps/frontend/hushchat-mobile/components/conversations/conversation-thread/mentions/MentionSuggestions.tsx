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
import { PLATFORM } from "@/constants/platformConstants";
import { useUserStore } from "@/store/user/useUserStore";

type MentionSuggestionsProps = {
  conversationId: number;
  mentionQuery: string | null;
  onSelect: (participant: ConversationParticipant) => void;
};

const DEBOUNCE_DELAY_MS = 250;

const MentionSuggestions = ({
  onSelect,
  conversationId,
  mentionQuery,
}: MentionSuggestionsProps) => {
  const debouncedKeyword = useDebounce(mentionQuery ?? "", DEBOUNCE_DELAY_MS);

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useConversationParticipantQuery(conversationId, debouncedKeyword);

  const { user } = useUserStore();
  const currentUserId = user?.id;

  const participants: ConversationParticipant[] = useMemo(() => {
    const list = pages?.pages.flatMap((p) => p?.content as ConversationParticipant[]) ?? [];

    return list.filter((p) => String(p.user.id) !== String(currentUserId));
  }, [pages, currentUserId]);

  const { activeIndex, setActiveIndex } = useKeyboardNavigation({
    items: participants,
    onSelect,
    enabled: true,
  });

  const renderItem = ({ item, index }: ListRenderItemInfo<ConversationParticipant>) => {
    const isActive = index === activeIndex;
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
          <InitialsAvatar
            name={fullName}
            size={AvatarSize.small}
            imageUrl={item.user.signedImageUrl}
          />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-text-primary-light dark:text-text-primary-dark">
            {fullName}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">@{item.user.username}</Text>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
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

  return (
    <View className="absolute bottom-24 left-3 z-50 w-[320px] max-w-[80%]">
      <View
        className={classNames(
          "rounded-lg custom-scrollbar",
          "bg-background-light dark:bg-background-dark",
          {
            "shadow-xl border border-gray-200 dark:border-gray-700": participants.length !== 0,
          }
        )}
      >
        <FlatList
          data={participants}
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
  listMaxHeight: {
    maxHeight: 300,
  },
});
