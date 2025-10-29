import { CHATS_PATH } from "@/constants/routes";
import { useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import GroupSettings from "@/components/conversations/conversation-info-panel/GroupSettings";

export default function ConversationGroupSettingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.replace(CHATS_PATH);
    }
  }, [id, router]);

  return <GroupSettings conversationId={+id} />;
}
