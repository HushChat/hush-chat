/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import MessageReactionsBottomSheet from "@/components/MessageReactionsBottomSheet";
import { useMessageReactionsQuery } from "@/query/useMessageReactionsQuery";
import { MessageReact } from "@/types/chat/types";

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
    () =>
      pages?.pages?.flatMap((page) => (page.content as MessageReact[]) || []) ||
      [],
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
