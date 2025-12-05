import React, { ReactElement, useCallback } from "react";
import {
  ConversationType,
  ConversationSearchResultKeys,
  ISectionedSearchResult,
  IConversation,
} from "@/types/chat/types";
import { KeyboardAvoidingView, ListRenderItemInfo, View, FlatList } from "react-native";
import SwipeActionItem from "@/components/conversations/conversation-list/common/SwipeActionItem";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { GestureDetector } from "react-native-gesture-handler";
import MobileConversationContextMenu from "@/components/conversations/MobileConversationContextMenu";
import { useGroupConversationInfoQuery } from "@/query/useGroupConversationInfoQuery";
import { useOneToOneConversationInfoQuery } from "@/query/useOneToOneConversationInfoQuery";
import { MotionConfig } from "@/motion/config/index";
import { MotionEasing } from "@/motion/easing/index";

const MAX_TO_RENDER_PER_BATCH = 20;
const WINDOW_SIZE = 20;
const INITIAL_NUM_TO_RENDER = 20;
const ON_END_REACHED_THRESHOLD = 0.1;
const PADDING_BOTTOM = 70;
const SWIPE_TRIGGER = 80;
const MAX_SWIPE_DISTANCE = 160;
const FULL_SWIPE_DISTANCE = 160;

interface BaseConversationListProps<T> {
  data: T[];
  renderItem: (rowData: ListRenderItemInfo<T>) => ReactElement | null;
  keyExtractor: (item: T) => string;
  ListHeaderComponent?: ReactElement | null;
  ListEmptyComponent?: ReactElement | null;
  ListFooterComponent?: ReactElement | null;
  onRefresh?: () => void;
  refreshing?: boolean;
  onEndReached?: () => void;
  onArchive: (conversationId: number) => Promise<void>;
  onDelete?: (conversationId: number) => Promise<void>;
  allowSwipe?: boolean;
}

function SwipeableRow<T>({
  item,
  index,
  renderItem,
  onArchive,
  allowSwipe,
  selectedConversationType,
  onMorePress,
}: {
  item: T;
  index: number;
  renderItem: (rowData: ListRenderItemInfo<T>) => ReactElement | null;
  onArchive: (conversationId: number) => Promise<void>;
  onDelete?: (conversationId: number) => Promise<void>;
  allowSwipe: boolean;
  selectedConversationType: ConversationType;
  onMorePress: (conversation: IConversation, resetSwipe: () => void) => void;
}) {
  const sectionedItem = item as unknown as ISectionedSearchResult;

  const isSwipeable = useCallback(() => {
    if (PLATFORM.IS_WEB || !allowSwipe) return false;

    const hasHeader = typeof sectionedItem._isHeader === "boolean";
    if (hasHeader && sectionedItem._isHeader) return false;

    const hasSectionType = typeof sectionedItem._sectionType !== "undefined";
    if (hasSectionType && sectionedItem._sectionType !== ConversationSearchResultKeys.CHATS)
      return false;

    return true;
  }, [allowSwipe, sectionedItem]);

  // The item itself is the conversation when _sectionType is CHATS
  const conversation = sectionedItem as unknown as IConversation;
  const isSwipedOpen = useSharedValue(false);

  const animConfig = {
    duration: MotionConfig.duration.md,
    easing: MotionEasing.standard,
  };

  const fastAnimConfig = {
    duration: MotionConfig.duration.sm,
    easing: MotionEasing.standard,
  };

  const { gesture, translateX, progress } = useSwipeGesture({
    enabled: isSwipeable(),
    direction: "horizontal",
    trigger: SWIPE_TRIGGER,
    maxDrag: MAX_SWIPE_DISTANCE,
    onSwipeLeft: () => {
      translateX.value = withTiming(-FULL_SWIPE_DISTANCE, animConfig);
      progress.value = withTiming(1, animConfig);
      isSwipedOpen.value = true;
    },
    onSwipeRight: () => {
      translateX.value = withTiming(0, fastAnimConfig);
      progress.value = withTiming(0, fastAnimConfig);
      isSwipedOpen.value = false;
    },
    shouldReset: false,
    allowLeft: true,
    allowRight: true,
    velocity: { horizontal: 400, vertical: 500 },
  });

  const resetSwipe = useCallback(() => {
    translateX.value = withTiming(0, fastAnimConfig);
    progress.value = withTiming(0, fastAnimConfig);
    isSwipedOpen.value = false;
  }, [translateX, progress, isSwipedOpen, fastAnimConfig]);

  const handleArchivePress = useCallback(async () => {
    if (isSwipeable() && conversation?.id) {
      resetSwipe();

      setTimeout(async () => {
        await onArchive(conversation.id);
      }, MotionConfig.duration.sm);
    }
  }, [isSwipeable, conversation.id, resetSwipe, onArchive]);

  const handleMorePress = useCallback(() => {
    if (conversation) {
      onMorePress(conversation, resetSwipe);
    }
  }, [conversation, onMorePress, resetSwipe]);

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    width: Math.max(0, Math.abs(translateX.value)),
  }));

  const rowData: ListRenderItemInfo<T> = {
    item,
    index,
    separators: {
      highlight: () => {},
      unhighlight: () => {},
      updateProps: () => {},
    },
  };

  if (!isSwipeable()) {
    return renderItem(rowData);
  }

  return (
    <View className="relative overflow-hidden">
      <Animated.View
        style={animatedBackgroundStyle}
        className="absolute right-0 top-0 bottom-0 flex-row items-center justify-end z-0"
      >
        <SwipeActionItem
          onPress={handleMorePress}
          backgroundColor="bg-grey-600"
          iconName="ellipsis-horizontal"
          text="More"
        />
        <SwipeActionItem
          onPress={handleArchivePress}
          backgroundColor="bg-green-600"
          iconName="archive"
          text={selectedConversationType === ConversationType.ARCHIVED ? "Unarchive" : "Archive"}
        />
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View
          style={animatedRowStyle}
          className="relative z-10 bg-background-light dark:bg-background-dark"
        >
          {renderItem(rowData)}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function BaseConversationList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  ListFooterComponent,
  onRefresh,
  refreshing = false,
  onEndReached,
  onArchive,
  allowSwipe = true,
}: BaseConversationListProps<T>) {
  const insets = useSafeAreaInsets();
  const { selectedConversationType } = useConversationStore();

  const [contextMenuVisible, setContextMenuVisible] = React.useState(false);
  const [selectedConversation, setSelectedConversation] = React.useState<IConversation | null>(
    null
  );
  const [resetSwipeFn, setResetSwipeFn] = React.useState<(() => void) | null>(null);

  const { conversationInfo: groupInfo } = useGroupConversationInfoQuery(
    selectedConversation?.isGroup ? (selectedConversation?.id ?? 0) : 0
  );

  const { conversationInfo: oneToOneInfo } = useOneToOneConversationInfoQuery(
    !selectedConversation?.isGroup ? (selectedConversation?.id ?? 0) : 0
  );

  const isActive = selectedConversation?.isGroup ? (groupInfo?.active ?? true) : true;

  const isBlocked = selectedConversation?.isGroup ? false : (oneToOneInfo?.blocked ?? false);

  const handleMorePress = useCallback((conversation: IConversation, resetSwipe: () => void) => {
    setSelectedConversation(conversation);
    setResetSwipeFn(() => resetSwipe);
    setContextMenuVisible(true);
  }, []);

  const renderSwipeableItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <SwipeableRow
        key={keyExtractor(item)}
        item={item}
        index={index}
        renderItem={renderItem}
        onArchive={onArchive}
        allowSwipe={allowSwipe}
        selectedConversationType={selectedConversationType}
        onMorePress={handleMorePress}
      />
    ),
    [renderItem, onArchive, allowSwipe, selectedConversationType, keyExtractor, handleMorePress]
  );

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1">
      <FlatList
        data={data}
        renderItem={renderSwipeableItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
        windowSize={WINDOW_SIZE}
        initialNumToRender={INITIAL_NUM_TO_RENDER}
        refreshing={refreshing}
        onRefresh={onRefresh}
        keyboardShouldPersistTaps="handled"
        onEndReached={onEndReached}
        onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
        contentContainerStyle={
          PLATFORM.IS_IOS && {
            paddingBottom: PADDING_BOTTOM + insets.bottom,
          }
        }
        keyboardDismissMode="on-drag"
        contentContainerClassName={`${!data.length && "flex-1"}`}
        scrollEnabled={true}
      />
      {selectedConversation && (
        <MobileConversationContextMenu
          visible={contextMenuVisible}
          onClose={() => {
            setContextMenuVisible(false);
            if (resetSwipeFn) {
              resetSwipeFn();
              setResetSwipeFn(null);
            }
          }}
          conversationId={selectedConversation.id}
          isFavorite={selectedConversation.favoriteByLoggedInUser ?? false}
          isPinned={selectedConversation.pinnedByLoggedInUser ?? false}
          isGroup={selectedConversation.isGroup}
          isBlocked={isBlocked}
          isActive={isActive}
        />
      )}
    </KeyboardAvoidingView>
  );
}
