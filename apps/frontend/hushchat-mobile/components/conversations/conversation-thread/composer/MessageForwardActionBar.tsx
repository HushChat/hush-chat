import React, { useMemo } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotionView } from "@/motion/MotionView";

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
  const selectedLabel = useMemo(() => `${count} selected`, [count]);

  return (
    <MotionView
      visible={visible}
      preset="slideUp"
      duration={200}
      pointerEvents={visible ? "auto" : "none"}
      className="absolute left-4 right-4 bottom-4"
      testID="selectionActionBar"
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark">
        <Text
          className="text-sm font-medium ml-2"
          style={isDark ? styles.selectedLabelDark : styles.selectedLabelLight}
        >
          {selectedLabel}
        </Text>

        <View className="flex-row items-center space-x-2">
          <Pressable
            onPress={onForward}
            disabled={count === 0}
            className="flex-row items-center px-4 py-2 rounded-full bg-primary-light dark:bg-primary-dark"
          >
            <Ionicons name="arrow-forward" size={16} color="white" style={styles.iconMarginRight} />
            <Text className="text-white text-sm font-medium">Forward</Text>
          </Pressable>

          <Pressable onPress={onCancel} className="p-2 active:opacity-60" testID="selectionCancel">
            <Ionicons name="close" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
          </Pressable>
        </View>
      </View>
    </MotionView>
  );
};

export default React.memo(MessageForwardActionBar);

const styles = StyleSheet.create({
  selectedLabelDark: { color: COLOR_TOKENS.labelDark },
  selectedLabelLight: { color: COLOR_TOKENS.labelLight },
  iconMarginRight: { marginRight: 4 },
});
