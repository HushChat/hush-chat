import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import MessageReactionsBottomSheet from '@/components/MessageReactionsBottomSheet';
import { useMessageReactionsQuery } from '@/query/useMessageReactionsQuery';
import { MessageReact } from '@/types/chat/types';

interface MobileConversationContextMenuProps {
  messageId: number;
  visible: boolean;
  position?: number;
  onClose: () => void;
}

const MessageReactionsModal = ({
  messageId,
  visible,
  onClose,
}: MobileConversationContextMenuProps) => {
  const [sheetVisible, setSheetVisible] = useState(visible);

  useEffect(() => {
    setSheetVisible(visible);
  }, [visible]);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    onClose();
  }, [onClose]);

  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessageReactionsQuery(messageId);

  const messageReactions = useMemo(
    () => pages?.pages?.flatMap((page) => (page.content as MessageReact[]) || []) || [],
    [pages],
  );

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <View>
      <MessageReactionsBottomSheet
        visible={sheetVisible}
        onClose={handleClose}
        title="Reactions"
        reactions={messageReactions}
        isLoading={isLoading}
        onEndReached={handleLoadMore}
      />
    </View>
  );
};

export default MessageReactionsModal;
