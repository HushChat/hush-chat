import { GestureResponderEvent, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import classNames from "classnames";
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
  isGroup: boolean;
  hasUnread?: boolean;
}

const ConversationMeta = ({
  lastMessage,
  muted,
  unreadCount,
  chevronButtonRef,
  onChevronPress,
  isGroup,
  hasUnread = false,
}: Props) => {
  const messageContent = LastMessagePreviewContent({ lastMessage, isGroup });

  const renderMessagePreview = () => {
    if (typeof messageContent === "string") {
      return (
        <AppText
          className={classNames(
            "text-sm flex-1",
            hasUnread
              ? "text-text-primary-light dark:text-text-primary-dark font-medium"
              : "text-gray-600 dark:text-text-secondary-dark"
          )}
          numberOfLines={1}
          style={{
            fontFamily: hasUnread ? "Poppins-Medium" : "Poppins-Regular, OpenMoji-Color",
          }}
        >
          {messageContent}
        </AppText>
      );
    }

    return <View className="flex-1">{messageContent}</View>;
  };

  return (
    <View className="flex-row items-center gap-x-2 flex-1">
      {renderMessagePreview()}

      {muted && <MaterialIcons name="notifications-off" size={14} color="#9CA3AF" />}

      {PLATFORM.IS_WEB && (
        <ChevronButton chevronButtonRef={chevronButtonRef} handleOptionsPress={onChevronPress} />
      )}

      {unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </View>
  );
};

export default ConversationMeta;
