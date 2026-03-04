import { useQuery } from "@tanstack/react-query";
import { getMessageUrlMetadata } from "@/apis/message";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";

export const useMessageUrlMetadataQuery = (messageId: number, isIncludeUrlMetadata: boolean) => {
  const {
    data: messageUrlMetadata,
    isLoading: isMessageUrlMetadataLoading,
    isFetching: isMessageUrlMetadataFetching,
    error: messageUrlMetadataError,
  } = useQuery({
    queryKey: conversationMessageQueryKeys.messageUrlMetadata(messageId),
    queryFn: () => getMessageUrlMetadata(messageId),
    enabled: isIncludeUrlMetadata,
    retry: false,
  });

  return {
    messageUrlMetadata,
    isMessageUrlMetadataLoading,
    messageUrlMetadataError,
    isMessageUrlMetadataFetching,
  };
};
