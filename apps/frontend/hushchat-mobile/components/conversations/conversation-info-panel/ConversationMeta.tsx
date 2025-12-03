import { GestureResponderEvent, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ChevronButton from "@/components/ChevronButton";
import { AppText } from "@/components/AppText";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { PLATFORM } from "@/constants/platformConstants";
import { IMessage } from "@/types/chat/types";
import { RefObject } from "react";
import { LastMessagePreviewContent } from "@/components/LastMessagePreviewContent";

interface Props {
  lastMessage: IMessage | undefined;
  muted: boolean;
  unreadCount: number;
  chevronButtonRef: RefObject<View | null>;
  onChevronPress: (e: GestureResponderEvent) => void;
}

const ConversationMeta = ({
  lastMessage,
  muted,
  unreadCount,
  chevronButtonRef,
  onChevronPress,
}: Props) => {
  const messageContent = LastMessagePreviewContent({ lastMessage });

  return (
    <View className="flex-row items-center gap-x-2 flex-1">
      {typeof messageContent === "string" ? (
        <AppText
          className="text-gray-600 dark:text-text-secondary-dark text-sm flex-1"
          numberOfLines={1}
        >
          {messageContent}
        </AppText>
      ) : (
        <View className="flex-1">{messageContent}</View>
      )}

      {muted && <MaterialIcons name="notifications-off" size={14} color="#9CA3AF" />}

      {PLATFORM.IS_WEB && (
        <ChevronButton chevronButtonRef={chevronButtonRef} handleOptionsPress={onChevronPress} />
      )}

      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </View>
  );
};

export default ConversationMeta;
