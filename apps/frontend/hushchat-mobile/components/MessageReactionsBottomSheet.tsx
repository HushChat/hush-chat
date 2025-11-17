import React from "react";
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
import { scheduleOnRN } from "react-native-worklets";
import { MotionView } from "@/motion/MotionView";
import { MotionEasing } from "@/motion/easing";
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

const colors = {
  BACKDROP: "rgba(0, 0, 0, 0.5)",
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.BACKDROP,
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

  const handleClose = () => {
    scheduleOnRN(onClose);
  };

  const renderReactionItem = ({ item }: { item: MessageReact }) => (
    <View className="flex-row items-center py-4 px-4">
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
      statusBarTranslucent
      animationType="none"
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <MotionView
          visible={visible}
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          duration={{ enter: 300, exit: 200 }}
          easing={{
            enter: MotionEasing.standard,
            exit: MotionEasing.standard,
          }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      </TouchableWithoutFeedback>

      <MotionView
        visible={visible}
        from={{ translateY: SCREEN_HEIGHT }}
        to={{ translateY: 0 }}
        duration={{ enter: 300, exit: 250 }}
        easing={{
          enter: MotionEasing.standard,
          exit: MotionEasing.standard,
        }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_HEIGHT * 0.7,
        }}
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

        <View
          style={{
            maxHeight: SCREEN_HEIGHT * 0.4,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <FlatList
            data={reactions}
            renderItem={renderReactionItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmptyComponent}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            contentContainerStyle={{
              flexGrow: reactions.length === 0 ? 1 : undefined,
            }}
          />
        </View>
      </MotionView>
    </Modal>
  );
};

export default MessageReactionsBottomSheet;
