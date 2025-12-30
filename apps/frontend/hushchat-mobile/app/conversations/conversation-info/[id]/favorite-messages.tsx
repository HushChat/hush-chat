import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { CHATS_PATH } from "@/constants/routes";
import FavoriteMessages from "@/components/conversations/conversation-info-panel/FavoriteMessages";

export default function ConversationFavoriteMessageRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace(CHATS_PATH);
    }
  }, [id, router]);

  return <FavoriteMessages conversationId={id} />;
}
