import { useCallback } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import ChatInterface from "@/components/conversations/ChatInterface/ChatInterface";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { IConversation } from "@/types/chat/types";
import { CONVERSATION, CHATS_PATH } from "@/constants/routes";

export default function ConversationScreen() {
  const { id } = useGlobalSearchParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;

  const { conversationsPages } = useConversationsQuery({});
  const conversations = conversationsPages?.pages.flatMap((page) => page.content) ?? [];

  const selectedConversation = conversationId
    ? (conversations.find((c) => c.id === conversationId) ?? null)
    : null;

  const handleSetSelectedConversation = useCallback((conversation: IConversation | null) => {
    if (conversation) {
      router.push(CONVERSATION(conversation.id));
    } else {
      router.push(CHATS_PATH);
    }
  }, []);

  return (
    <ChatInterface
      selectedConversation={selectedConversation}
      setSelectedConversation={handleSetSelectedConversation}
    />
  );
}
