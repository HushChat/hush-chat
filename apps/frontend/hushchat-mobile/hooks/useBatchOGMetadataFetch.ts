import { useEffect, useRef } from "react";
import { InfiniteData } from "@tanstack/react-query";
import { CursorPaginatedResponse } from "@/apis/conversation";
import { IMessage } from "@/types/chat/types";
import { getBatchMessageUrlMetadata } from "@/apis/message";
import { useOGMetadataStore } from "@/store/ogMetadata/useOGMetadataStore";
import { logError } from "@/utils/logger";

/**
 * Watches conversation message pages and batch-fetches OG metadata
 * for messages that have isIncludeUrlMetadata=true but aren't yet in the store.
 */
export function useBatchOGMetadataFetch(
  pages: InfiniteData<CursorPaginatedResponse<IMessage>> | undefined
) {
  const { metadata, pendingMessageIds, setBulkMetadata, addPendingIds, removePendingIds } =
    useOGMetadataStore();
  const metadataRef = useRef(metadata);
  const pendingRef = useRef(pendingMessageIds);

  metadataRef.current = metadata;
  pendingRef.current = pendingMessageIds;

  useEffect(() => {
    if (!pages?.pages) return;

    const messageIdsToFetch: number[] = [];

    for (const page of pages.pages) {
      for (const message of page.content) {
        if (
          message.isIncludeUrlMetadata &&
          !(message.id in metadataRef.current) &&
          !pendingRef.current.has(message.id)
        ) {
          messageIdsToFetch.push(message.id);
        }
      }
    }

    if (messageIdsToFetch.length === 0) return;

    addPendingIds(messageIdsToFetch);

    getBatchMessageUrlMetadata(messageIdsToFetch)
      .then((result) => {
        setBulkMetadata(result);
      })
      .catch((error) => {
        logError("Failed to batch fetch OG metadata", error);
      })
      .finally(() => {
        removePendingIds(messageIdsToFetch);
      });
  }, [pages]);
}
