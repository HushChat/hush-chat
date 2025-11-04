import { QueryClient, InfiniteData, QueryKey } from "@tanstack/react-query";
import { IConversation, IMessage } from "@/types/chat/types";

interface OffsetPaginatedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export function updateConversationsCache(
  queryClient: QueryClient,
  queryKey: QueryKey,
  newMessage: IMessage,
  conversationId: number
) {
  queryClient.setQueryData<InfiniteData<OffsetPaginatedResponse<IConversation>>>(
    queryKey,
    (oldData) => {
      if (!oldData?.pages) return oldData;
      const allConversations = oldData.pages.flatMap((page) => page.content || []);

      const updatedConversations = allConversations.map((conv) => {
        if (conv.id === conversationId) {
          return { ...conv, messages: [newMessage] };
        }
        return conv;
      });

      const targetIndex = updatedConversations.findIndex((c) => c.id === conversationId);
      if (targetIndex === -1) return oldData;

      const [updatedConv] = updatedConversations.splice(targetIndex, 1);
      updatedConversations.unshift(updatedConv);

      const newPages = oldData.pages.map((page, index) => {
        const pageSize = page.content?.length || 0;
        const start = index * pageSize;
        const content = updatedConversations.slice(start, start + pageSize);
        
        return { ...page, content };
      });

      return { ...oldData, pages: newPages };
    }
  );
}