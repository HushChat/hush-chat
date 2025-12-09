import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";

export interface SelectionActionBarProps {
  visible: boolean;
  count: number;
  isDark: boolean;
  onCancel: () => void;
  onForward: () => void;
}

const COLOR_TOKENS = {
  labelDark: "#E5E7EB",
  labelLight: "#374151",
};

const MessageForwardActionBar = ({
  visible,
  count,
  isDark,
  onCancel,
  onForward,
}: SelectionActionBarProps) => {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(visible ? 0 : 16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 16,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  const selectedLabel = useMemo(() => `${count} selected`, [count]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
      testID="selectionActionBar"
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark rounded-lg shadow-lg">
        <AppText
          className="text-sm font-medium ml-2"
          style={isDark ? styles.selectedLabelDark : styles.selectedLabelLight}
        >
          {selectedLabel}
        </AppText>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={onForward}
            disabled={count === 0}
            className="flex-row items-center px-4 py-2 rounded-full bg-primary-light dark:bg-primary-dark"
          >
            <Ionicons name="arrow-forward" size={16} color="white" style={styles.iconMarginRight} />
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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 9999,
  },
  selectedLabelDark: { color: COLOR_TOKENS.labelDark },
  selectedLabelLight: { color: COLOR_TOKENS.labelLight },
  iconMarginRight: { marginRight: 4 },
});
