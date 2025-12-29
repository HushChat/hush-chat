import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessagesRepo } from "@/db/messages-repo";
import { sendMessageByConversationId } from "@/apis/conversation";
import { useNetworkStatus } from "./useNetworkStatus";
import { logError } from "@/utils/logger";

export const useOfflineSync = () => {
  const isOnline = useNetworkStatus();
  const queryClient = useQueryClient();
  const isSyncing = useRef(false);

  useEffect(() => {
    const syncMessages = async () => {
      if (!isOnline || isSyncing.current) return;

      isSyncing.current = true;
      console.log("Starting offline message sync...");

      try {
        const pendingMessages = await MessagesRepo.getPendingMessages();

        if (pendingMessages.length === 0) {
          isSyncing.current = false;
          return;
        }

        for (const message of pendingMessages) {
          try {
            console.log(
              `Syncing message ${message.id} for conversation ${message.conversation_id}`
            );

            // Optimistically we've already shown it, so we just want to send it to server
            // and then refresh the query to get the real ID from server or just rely on refetch.
            const response = await sendMessageByConversationId(
              message.conversation_id,
              message.message_text,
              message.parent_message_id ?? undefined
            );

            if (response.data) {
              await MessagesRepo.deletePendingMessage(message.id);
            } else {
              console.warn("Failed to sync message", response.error);
            }
          } catch (error) {
            logError("Error syncing message:", error);
          }
        }

        // Refetch conversations to ensure we have the correct server state (ids etc)
        // Invalidating all might be aggressive, but safest for now.
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      } catch (error) {
        logError("Error during offline sync:", error);
      } finally {
        isSyncing.current = false;
      }
    };

    if (isOnline) {
      syncMessages();
    }
  }, [isOnline, queryClient]);
};
