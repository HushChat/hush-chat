import { GestureResponderEvent, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LastMessagePreview from "@/components/UnsendMessagePreview";
import ChevronButton from "@/components/ChevronButton";
import { AppText } from "@/components/AppText";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { PLATFORM } from "@/constants/platformConstants";
import { IMessage } from "@/types/chat/types";
import { RefObject } from "react";

interface Props {
  lastMessage: IMessage | undefined;
  lastMessageText: string | undefined;
  muted: boolean;
  unreadCount: number;
  chevronButtonRef: RefObject<View | null>;
  onChevronPress: (e: GestureResponderEvent) => void;
}

const ConversationMeta = ({
  lastMessage,
  lastMessageText,
  muted,
  unreadCount,
  chevronButtonRef,
  onChevronPress,
}: Props) => {
  return (
    <View className="flex-row items-center gap-x-2 flex-1">
      <AppText
        className="text-gray-600 dark:text-text-secondary-dark text-sm flex-1"
        numberOfLines={1}
      >
        {lastMessage?.isUnsend ? (
          <LastMessagePreview unsendMessage={lastMessage} />
        ) : (
          lastMessageText
        )}
      </AppText>

      {muted && <MaterialIcons name="notifications-off" size={14} color="#9CA3AF" />}

      {PLATFORM.IS_WEB && (
        <ChevronButton chevronButtonRef={chevronButtonRef} handleOptionsPress={onChevronPress} />
      )}

      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </View>
  );
};

export default ConversationMeta;
