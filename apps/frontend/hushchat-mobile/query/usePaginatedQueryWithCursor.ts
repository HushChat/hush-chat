import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { CursorPaginatedQueryOptions, CursorPaginatedResponse } from '@/apis/conversation';
import { useState, useCallback, useRef } from 'react';

/**
 * A simplified hook for paginating (older) messages.
 * It only handles the initial load and fetching the next page (older items).
 * New items are expected to be handled by a WebSocket.
 * 
 * Enhanced with message navigation capabilities for jumping to specific messages.
 */
export function usePaginatedQueryWithCursor<T extends { id: number | string }>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
}: CursorPaginatedQueryOptions<T>) {
  const queryClient = useQueryClient();
  const [isLoadingToMessage, setIsLoadingToMessage] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<number | string | null>(null);
  const isFetchingToMessage = useRef(false);

  const {
    data: pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<CursorPaginatedResponse<T>>({
    queryKey,
    enabled,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const response = await queryFn({ beforeId: Number(pageParam), size: pageSize });
      if (!response.data) throw new Error(response.error || 'Failed to fetch data');
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const content = lastPage?.content ?? [];
      if (content.length < pageSize) return undefined;

      const oldestMessage = content[content.length - 1];
      return oldestMessage?.id;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  /**
   * Check if a message with the given ID exists in currently loaded pages
   */
  const isMessageLoaded = useCallback((messageId: number | string): boolean => {
    const data = queryClient.getQueryData<InfiniteData<CursorPaginatedResponse<T>>>(queryKey);
    if (!data?.pages) return false;
    
    return data.pages.some(page => 
      page.content.some(item => String(item.id) === String(messageId))
    );
  }, [queryClient, queryKey]);

  /**
   * Fetch pages until we find the target message or reach the end
   */
  const fetchToMessage = useCallback(async (messageId: number | string): Promise<boolean> => {
    // Prevent concurrent fetches
    if (isFetchingToMessage.current) {
      return false;
    }

    isFetchingToMessage.current = true;
    setIsLoadingToMessage(true);
    setTargetMessageId(messageId);

    try {
      // Check if message is already loaded
      if (isMessageLoaded(messageId)) {
        setIsLoadingToMessage(false);
        setTargetMessageId(messageId); // Keep target ID for scrolling
        isFetchingToMessage.current = false;
        return true;
      }

      // Keep fetching older pages until we find the message
      let found = false;
      let attempts = 0;
      const maxAttempts = 100; // Adjust based on your needs (100 pages * 20 msgs = 2000 messages)

      while (!found && attempts < maxAttempts && hasNextPage) {
        // Fetch the next page
        const result = await fetchNextPage();
        
        if (!result.data) {
          break;
        }

        // Wait a bit for query cache to update
        await new Promise(resolve => setTimeout(resolve, 50));

        // Check if message is now loaded
        found = isMessageLoaded(messageId);
        attempts++;

        // If we've reached the end of pages, stop
        if (!hasNextPage) {
          break;
        }
      }

      setIsLoadingToMessage(false);
      setTargetMessageId(found ? messageId : null);
      isFetchingToMessage.current = false;
      return found;
    } catch (error) {
      console.error('Error fetching to message:', error);
      setIsLoadingToMessage(false);
      setTargetMessageId(null);
      isFetchingToMessage.current = false;
      return false;
    }
  }, [isMessageLoaded, hasNextPage, fetchNextPage, queryClient, queryKey]);

  /**
   * Navigate to a specific message by its ID
   * This will fetch older messages if needed
   * 
   * @param messageId - The ID of the message to navigate to
   * @returns Promise<boolean> - true if message was found, false otherwise
   */
  const navigateToMessage = useCallback(async (messageId: number | string): Promise<boolean> => {
    return await fetchToMessage(messageId);
  }, [fetchToMessage]);

  return {
    pages,
    isLoading,
    error: error as Error | null,
    fetchOlder: fetchNextPage,
    hasMoreOlder: hasNextPage ?? false,
    isFetchingOlder: isFetchingNextPage,
    refetch,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
    
    // New methods for message navigation
    navigateToMessage,
    isLoadingToMessage,
    targetMessageId,
    isMessageLoaded,
  };
}