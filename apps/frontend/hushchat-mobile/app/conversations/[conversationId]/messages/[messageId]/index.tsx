import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useSearchSelectedMessageStore } from "@/store/search-message/useSearchMessageStore";
import { CONVERSATION } from "@/constants/routes";

export default function ConversationSelectedMessage() {
  const router = useRouter();
  const { setSearchSelectedMessageId } = useSearchSelectedMessageStore();
  const { conversationId, messageId } = useLocalSearchParams<{
    conversationId: string;
    messageId: string;
  }>();

  useEffect(() => {
    setSearchSelectedMessageId(Number(conversationId), Number(messageId));
    router.replace(CONVERSATION(Number(conversationId)));
  }, [conversationId, messageId]);

  return <></>;
}
