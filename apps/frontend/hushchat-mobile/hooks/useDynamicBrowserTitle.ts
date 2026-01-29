import { useEffect } from "react";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";

const BASE_TITLE = "HushChat";

/**
 * Updates browser tab title with unread count
 */
export function useDynamicBrowserTitle() {
  const { totalUnreadCount } = useConversationNotificationsContext();

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (totalUnreadCount > 0) {
      const displayCount = totalUnreadCount > 99 ? "99+" : totalUnreadCount;
      document.title = `(${displayCount}) ${BASE_TITLE}`;
    } else {
      document.title = BASE_TITLE;
    }
  }, [totalUnreadCount]);
}

export function DynamicBrowserTitle() {
  useDynamicBrowserTitle();
  return null;
}
