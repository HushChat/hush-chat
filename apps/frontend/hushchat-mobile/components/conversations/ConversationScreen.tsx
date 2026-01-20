import { useState } from "react";
import { useGlobalSearchParams } from "expo-router";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { IConversation } from "@/types/chat/types";
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

  return <ChatInterfaceWeb selectedConversation={selectedConversation} />;
}
