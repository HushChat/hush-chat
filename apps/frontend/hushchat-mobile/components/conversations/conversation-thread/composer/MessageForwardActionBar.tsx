import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SelectionActionBarProps {
  visible: boolean;
  count: number;
  isDark: boolean;
  onCancel: () => void;
  onForward: () => void;
}

const MessageForwardActionBar = ({
  visible,
  count,
  isDark,
  onCancel,
  onForward,
}: SelectionActionBarProps) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateY, {
      toValue: visible ? 0 : 16,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity, translateY]);

  const selectedLabel = useMemo(() => `${count} selected`, [count]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute left-4 right-4 bottom-4"
      style={{
        opacity,
        transform: [{ translateY }],
      }}
      testID="selectionActionBar"
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark">
        <Text
          className="text-sm font-medium ml-2"
          style={{ color: isDark ? "#E5E7EB" : "#374151" }}
        >
          {selectedLabel}
        </Text>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={onForward}
            disabled={count === 0}
            className="flex-row items-center px-4 py-2 rounded-full bg-primary-light dark:bg-primary-dark"
          >
            <Ionicons name="arrow-forward" size={16} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white text-sm font-medium">Forward</Text>
          </Pressable>

          <Pressable onPress={onCancel} className="p-2" testID="selectionCancel">
            <Ionicons name="close" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

export default React.memo(MessageForwardActionBar);
