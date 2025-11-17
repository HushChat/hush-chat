import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { useAppTheme } from "@/hooks/useAppTheme";
import { MessageReact, REACTION_EMOJIS } from "@/types/chat/types";
import { useMessageReactionsQuery } from "@/query/useMessageReactionsQuery";
import { getAdjustedPosition } from "@/utils/commonUtils";

interface MessageReactionsModalProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  messageId: number;
}

const MessageReactionsModalWeb = ({
  visible,
  position,
  onClose,
  messageId,
}: MessageReactionsModalProps) => {
  const modalRef = useRef<View>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const { isDark } = useAppTheme();

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessageReactionsQuery(messageId);

  const messageReactions = useMemo(
    () => pages?.pages?.flatMap((page) => (page.content as MessageReact[]) || []) || [],
    [pages]
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const modalHeight = Math.min(400, messageReactions.length * 56 + 80);
  const modalWidth = 280;

  const adjustedPosition = getAdjustedPosition(
    position,
    screenWidth,
    screenHeight,
    modalWidth,
    modalHeight
  );

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 120);
  };

  const renderReactionItem = ({ item }: { item: MessageReact }) => (
    <View
      className={classNames(
        "px-4 py-3 flex-row items-center border-b",
        isDark ? "border-[#2C3650]/40" : "border-[#E5E7EB]/50"
      )}
    >
      <Text className="text-2xl mr-3">{REACTION_EMOJIS[item.reactionType]}</Text>
      <Text
        className={classNames(
          "text-[15px] font-medium flex-1",
          isDark ? "text-text-primary-dark" : "text-text-primary-light"
        )}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color={isDark ? "#9ca3af" : "#6B7280"} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color={isDark ? "#9ca3af" : "#6B7280"} />
        </View>
      );
    }

    return (
      <View className="py-12 items-center justify-center">
        <Ionicons name="heart-outline" size={48} color={isDark ? "#4B5563" : "#D1D5DB"} />
        <Text
          className={classNames(
            "mt-3 text-[15px]",
            isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
          )}
        >
          No reactions yet
        </Text>
      </View>
    );
  };

  return (
    <Modal transparent={true} visible={shouldRender} onRequestClose={handleClose}>
      <Pressable className="flex-1" onPress={handleClose} style={styles.pressableCursor}>
        <View
          ref={modalRef}
          pointerEvents="box-none"
          className={classNames(
            "absolute rounded-xl overflow-hidden border backdrop-blur-md transition-all duration-200 ease-out",
            isAnimating
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-1.5",
            isDark
              ? "bg-secondary-dark/95 border-[#2C3650]/60 shadow-[0_4px_14px_rgba(0,0,0,0.35)]"
              : "bg-white/90 border-[#E5E7EB]/70 shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
          )}
          style={{
            left: adjustedPosition.x,
            top: adjustedPosition.y,
            width: modalWidth,
            maxHeight: modalHeight,
          }}
        >
          <View
            className={classNames(
              "px-4 py-3 border-b",
              isDark ? "border-[#2C3650]/60" : "border-[#E5E7EB]/70"
            )}
          >
            <Text
              className={classNames(
                "text-[16px] font-semibold",
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
              )}
            >
              Reactions
            </Text>
          </View>

          <FlatList
            data={messageReactions}
            renderItem={renderReactionItem}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={true}
            style={styles.listMaxHeight}
            contentContainerStyle={
              messageReactions.length === 0 ? styles.flexGrow1 : styles.flexGrow0
            }
          />
        </View>
      </Pressable>
    </Modal>
  );
};

export default MessageReactionsModalWeb;

const styles = StyleSheet.create({
  pressableCursor: {
    cursor: "auto",
  },
  listMaxHeight: {
    maxHeight: 56 * 3.5,
  },
  flexGrow1: {
    flexGrow: 1,
  },
  flexGrow0: {
    flexGrow: 0,
  },
});
