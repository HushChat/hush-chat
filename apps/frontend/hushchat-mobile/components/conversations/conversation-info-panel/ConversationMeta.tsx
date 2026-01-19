import { GestureResponderEvent, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ChevronButton from "@/components/ChevronButton";
import { AppText } from "@/components/AppText";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { PLATFORM } from "@/constants/platformConstants";
import { IMessage } from "@/types/chat/types";
import { RefObject } from "react";
import { LastMessagePreviewContent } from "@/components/LastMessagePreviewContent";
import { hasGif } from "@/utils/messageUtils";

interface Props {
  lastMessage: IMessage | undefined;
  muted: boolean;
  unreadCount: number;
  chevronButtonRef: RefObject<View | null>;
  onChevronPress: (e: GestureResponderEvent) => void;
  isGroup: boolean;
}

const ConversationMeta = ({
  lastMessage,
  muted,
  unreadCount,
  chevronButtonRef,
  onChevronPress,
  isGroup,
}: Props) => {
  const messageContent = LastMessagePreviewContent({ lastMessage, isGroup });
  const isGif = hasGif(lastMessage);

  const renderMessagePreview = () => {
    if (isGif) {
      return (
        <View className="flex-row items-center gap-1 flex-1">
          <MaterialIcons
            name="gif"
            size={20}
            className="text-gray-600 dark:text-text-secondary-dark"
            color="#4B5563"
          />
          <AppText
            className="text-gray-600 dark:text-text-secondary-dark text-sm"
            numberOfLines={1}
            style={{
              fontFamily: "Poppins-Regular, OpenMoji-Color",
            }}
          >
            GIF
          </AppText>
        </View>
      );
    }

    if (typeof messageContent === "string") {
      return (
        <AppText
          className="text-gray-600 dark:text-text-secondary-dark text-sm flex-1"
          numberOfLines={1}
          style={{
            fontFamily: "Poppins-Regular, OpenMoji-Color",
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
