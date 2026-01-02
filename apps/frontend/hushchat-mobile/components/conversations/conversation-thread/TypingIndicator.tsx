import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { AppText } from "@/components/AppText";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";

interface TypingIndicatorProps {
  conversationId: string | number;
  className?: string;
  textClassName?: string;
  showText?: boolean;
}

export const TypingIndicator = ({
  conversationId,
  className,
  textClassName,
  showText = true,
}: TypingIndicatorProps) => {
  const { getTypingUsersForConversation } = useConversationNotificationsContext();
  const typingUsers = getTypingUsersForConversation(conversationId);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].chatUserName} is typing `;
    if (typingUsers.length === 2) {
      return `${typingUsers[0].chatUserName} and ${typingUsers[1].chatUserName} are typing `;
    }
    return `${typingUsers[0].chatUserName} and ${typingUsers.length - 1} others are typing `;
  };

  return (
    <View className={className || "flex-row items-center gap-1"}>
      {showText && (
        <AppText
          className={textClassName || "text-xs text-green-600 dark:text-green-500"}
          numberOfLines={1}
        >
          {getTypingText()}
        </AppText>
      )}
      <TypingDots />
    </View>
  );
};

const TypingDots = () => {
  const opacity1 = useSharedValue(1);
  const opacity2 = useSharedValue(1);
  const opacity3 = useSharedValue(1);

  useEffect(() => {
    opacity1.value = withRepeat(
      withSequence(withTiming(0.3, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1
    );

    opacity2.value = withRepeat(
      withSequence(
        withDelay(150, withTiming(0.3, { duration: 400 })),
        withTiming(1, { duration: 400 })
      ),
      -1
    );

    opacity3.value = withRepeat(
      withSequence(
        withDelay(300, withTiming(0.3, { duration: 400 })),
        withTiming(1, { duration: 400 })
      ),
      -1
    );
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: opacity1.value,
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: opacity2.value,
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: opacity3.value,
  }));

  return (
    <View className="flex-row items-center gap-0.5 ml-1">
      <Animated.View
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
        style={dot1Style}
      />
      <Animated.View
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
        style={dot2Style}
      />
      <Animated.View
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
        style={dot3Style}
      />
    </View>
  );
};
