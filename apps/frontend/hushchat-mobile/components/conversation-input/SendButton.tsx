import React from "react";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming, withSpring } from "react-native-reanimated";
import { COLOR_ACTIVITY } from "@/constants/composerConstants";
import * as Haptics from "expo-haptics";
import { PLATFORM } from "@/constants/platformConstants";

interface SendButtonProps {
  hasContent: boolean;
  isSending: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SendButton = ({ hasContent, isSending, onPress }: SendButtonProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(hasContent ? 1 : 0.6, { damping: 12, stiffness: 200 }) }],
    opacity: withTiming(hasContent ? 1 : 0.5, { duration: 150 }),
  }));

  const handlePress = () => {
    if (!PLATFORM.IS_WEB) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  if (isSending) {
    return <ActivityIndicator size="small" color={COLOR_ACTIVITY} />;
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={!hasContent}
      style={[
        styles.sendButton,
        hasContent ? styles.sendButtonActive : styles.sendButtonInactive,
        animatedStyle,
      ]}
    >
      <Ionicons
        name="send"
        size={18}
        color={hasContent ? "#FFFFFF" : "#9CA3AF"}
        style={styles.sendIcon}
      />
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#6B4EFF",
  },
  sendButtonInactive: {
    backgroundColor: "transparent",
  },
  sendIcon: {
    marginLeft: 2,
  },
});
