import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { MessageReact, REACTION_EMOJIS } from "@/types/chat/types";

interface MessageReactionsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  reactions: MessageReact[];
  isLoading?: boolean;
  title?: string;
  onEndReached: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  touchableArea: {
    flex: 1,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  listContainer: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
});

const MessageReactionsBottomSheet = ({
  visible,
  onClose,
  reactions,
  isLoading = false,
  title = "Reactions",
  onEndReached,
}: MessageReactionsBottomSheetProps) => {
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, translateY, opacity]);

  const handleClose = () => {
    scheduleOnRN(onClose);
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const listContainerStyle = {
    paddingBottom: insets.bottom + 16,
  };

  const renderReactionItem = ({ item, index }: { item: MessageReact; index: number }) => (
    <View className={`flex-row items-center py-4 px-4 ${index < reactions.length - 1 ? "" : ""}`}>
      <Text className="text-2xl mr-3">{REACTION_EMOJIS[item.reactionType]}</Text>
      <Text
        className="text-base font-medium flex-1 text-text-primary-light dark:text-text-primary-dark"
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      );
    }

    return (
      <View className="py-12 items-center justify-center">
        <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
        <Text className="mt-3 text-base text-text-secondary-light dark:text-text-secondary-dark">
          No reactions yet
        </Text>
      </View>
    );
  };

  const contentContainerStyle = reactions.length === 0 ? styles.emptyContentContainer : undefined;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.touchableArea} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheetContainer, sheetStyle]}
          className="bg-background-light dark:bg-background-dark rounded-t-3xl"
        >
          <View className="items-center py-3">
            <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </View>

          <View className="px-4 pb-2">
            <Text className="text-lg font-semibold text-center text-text-primary-light dark:text-text-primary-dark">
              {title}
            </Text>
          </View>

          <View style={[styles.listContainer, listContainerStyle]}>
            <FlatList
              data={reactions}
              renderItem={renderReactionItem}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={renderEmptyComponent}
              onEndReached={onEndReached}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={contentContainerStyle}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default MessageReactionsBottomSheet;
