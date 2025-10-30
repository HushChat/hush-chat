/**
 * ConversationIdRoute
 *
 * Web route handler for displaying conversation info by its ID.
 * - Reads the conversation ID from the URL using `useLocalSearchParams`.
 * - Redirects back to the chats screen if no ID is provided.
 * - Renders the conversation details through component.
 *
 * This acts as the placeholder route for the conversation info sidebar/panel
 * in the web layout of the chat application.
 */
import { useLocalSearchParams, useRouter } from "expo-router";
import ConversationInfoPanel from "@/components/conversations/conversation-info-panel/ConversationInfoPanel";
import { useEffect } from "react";
import { CHATS_PATH } from "@/constants/routes";

export default function ConversationIdRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace(CHATS_PATH);
    }
  }, [id, router]);

  return <ConversationInfoPanel conversationId={+id} />;
}
