import React, { useCallback, useMemo, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";

import { IMessage, IMessageAttachment } from "@/types/chat/types";
import { ImageGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid";
import { ImagePreview } from "@/components/conversations/conversation-thread/composer/image-preview/ImagePreview";
import FormattedText from "@/components/FormattedText";
import { AppText } from "@/components/AppText";

interface ImageGroupBubbleProps {
  messages: IMessage[];
  isCurrentUser: boolean;
  selected: boolean;
  selectionMode: boolean;
  onBubblePress: () => void;
}

const extractAttachmentsFromMessages = (messages: IMessage[]): IMessageAttachment[] => {
  const attachments: IMessageAttachment[] = [];

  messages.forEach((message) => {
    if (message.messageAttachments && message.messageAttachments.length > 0) {
      attachments.push(...message.messageAttachments);
    }
  });

  return attachments;
};

const getFirstCaption = (messages: IMessage[]): { text: string; mentions: any[] } => {
  for (const msg of messages) {
    if (msg.messageText?.trim()) {
      return { text: msg.messageText, mentions: msg.mentions || [] };
    }
  }
  return { text: "", mentions: [] };
};

export const ImageGroupBubble: React.FC<ImageGroupBubbleProps> = ({
  messages,
  isCurrentUser,
  selected,
  selectionMode,
  onBubblePress,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const attachments = useMemo(() => extractAttachmentsFromMessages(messages), [messages]);

  const caption = useMemo(() => getFirstCaption(messages), [messages]);
  const hasCaption = caption.text.length > 0;

  const openPreview = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setPreviewVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  if (attachments.length === 0) return null;

  return (
    <>
      <Pressable onPress={onBubblePress}>
        {selectionMode && (
          <View
            className={classNames("absolute -top-1.5 z-10", {
              "-right-1.5": isCurrentUser,
              "-left-1.5": !isCurrentUser,
            })}
          >
            <Ionicons
              name={selected ? "checkmark-circle" : "ellipse-outline"}
              size={20}
              color={selected ? "#3B82F6" : "#9CA3AF"}
            />
          </View>
        )}

        <View className={classNames("rounded-xl", isCurrentUser ? "items-end" : "items-start")}>
          <View
            className={classNames("rounded-lg border-2", {
              "bg-primary-light dark:bg-primary-dark rounded-tr-none": isCurrentUser,
              "bg-secondary-light dark:bg-secondary-dark rounded-tl-none": !isCurrentUser,
              "border-sky-500 dark:border-sky-400": selected && selectionMode,
              "border-transparent": !(selected && selectionMode),
              "px-3 py-2": hasCaption,
              "p-1": !hasCaption,
            })}
            style={styles.bubbleMaxWidth}
          >
            {}
            <View className={hasCaption ? "mb-2" : ""}>
              <ImageGrid images={attachments} onImagePress={openPreview} />
            </View>

            {}
            {hasCaption && (
              <FormattedText
                text={caption.text}
                mentions={caption.mentions}
                isCurrentUser={isCurrentUser}
              />
            )}
          </View>

          {}
          {messages.length > 1 && (
            <View className="mt-1">
              <AppText className="text-xs text-gray-400">{messages.length} photos</AppText>
            </View>
          )}
        </View>
      </Pressable>

      {}
      <ImagePreview
        visible={previewVisible}
        images={attachments}
        initialIndex={selectedImageIndex}
        onClose={closePreview}
      />
    </>
  );
};

const styles = StyleSheet.create({
  bubbleMaxWidth: {
    maxWidth: 305,
  },
});

export default ImageGroupBubble;
