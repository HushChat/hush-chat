import { useCallback, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { IConversation } from "@/types/chat/types";
import { CONVERSATION, CHATS_PATH } from "@/constants/routes";
import ChatInterfaceWeb from "@/components/conversations/ChatInterface/ChatInterfaceWeb";
import { useLinkConversation } from "@/hooks/useLinkConversation";

export default function ConversationScreen() {
  const { id } = useGlobalSearchParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;

  const { conversationsPages } = useConversationsQuery({});
  const conversations = conversationsPages?.pages.flatMap((page) => page.content) ?? [];
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

  useLinkConversation({
    initialConversationId: conversationId ?? undefined,
    conversations,
    onConversationFound: setSelectedConversation,
  });

  const handleSetSelectedConversation = useCallback((conversation: IConversation | null) => {
    if (conversation) {
      setSelectedConversation(conversation);
      router.push(CONVERSATION(conversation.id));
    } else {
      setSelectedConversation(null);
      router.push(CHATS_PATH);
    }
  }, []);

  return (
    <ChatInterfaceWeb
      selectedConversation={selectedConversation}
      setSelectedConversation={handleSetSelectedConversation}
    />
  );
}
