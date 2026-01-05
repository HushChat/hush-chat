import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import { useTypingIndicators } from "@/hooks/useTypingIndicators";

interface TypingIndicatorProps {
  conversationId: string | number;
  className?: string;
  textClassName?: string;
  isGroupChat?: boolean;
}

export const TypingIndicator = ({
  conversationId,
  className,
  textClassName,
  isGroupChat = true,
}: TypingIndicatorProps) => {
  const { getTypingUsersForConversation } = useTypingIndicators();
  const typingUsers = getTypingUsersForConversation(conversationId);
  const isVisible = typingUsers.length > 0;

  const getTypingText = () => {
    if (!isGroupChat) return "typing ";
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].chatUserName} is typing `;
    if (typingUsers.length === 2) {
      return `${typingUsers[0].chatUserName} and ${typingUsers[1].chatUserName} are typing `;
    }
    return `${typingUsers[0].chatUserName} and ${typingUsers.length - 1} others are typing `;
  };

  return (
    <MotionView
      visible={isVisible}
      preset="fadeIn"
      duration={200}
      className={className || "flex-row items-center gap-1"}
    >
      <AppText
        className={textClassName || "text-xs text-green-600 dark:text-green-500"}
        numberOfLines={1}
      >
        {getTypingText()}
      </AppText>
      <TypingDots visible={isVisible} />
    </MotionView>
  );
};

interface TypingDotsProps {
  visible: boolean;
}

const TypingDots = ({ visible }: TypingDotsProps) => {
  return (
    <View className="flex-row items-center gap-0.5 ml-1">
      <MotionView
        visible={visible}
        from={{ opacity: 1 }}
        to={{ opacity: 0.3 }}
        duration={400}
        delay={0}
        easing="linear"
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
      />
      <MotionView
        visible={visible}
        from={{ opacity: 1 }}
        to={{ opacity: 0.3 }}
        duration={400}
        delay={150}
        easing="linear"
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
      />
      <MotionView
        visible={visible}
        from={{ opacity: 1 }}
        to={{ opacity: 0.3 }}
        duration={400}
        delay={300}
        easing="linear"
        className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-500"
      />
    </View>
  );
};
