import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface MessageHighlighterProps {
  messageId: number;
  highlightedMessageId: number | null;
  children: React.ReactNode;
}

/**
 * MessageHighlighter
 * 
 * Wraps a message content bubble and applies a vertical translation animation
 * when the message ID matches the highlightedMessageId.
 * Moves down and then back up.
 */
export const MessageHighlighter: React.FC<MessageHighlighterProps> = ({
  messageId,
  highlightedMessageId,
  children,
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (highlightedMessageId === messageId) {
      translateY.value = 0;

      // Move down and then back up
      translateY.value = withSequence(
        withTiming(12, { duration: 300, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.ease) })
      );
    }
  }, [highlightedMessageId, messageId, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

export default MessageHighlighter;