import { ConversationType } from "@/types/chat/types";

export const getConversationFilters = (selectedConversationType: ConversationType) => {
  return [
    {
      key: ConversationType.ALL,
      label: "All",
      isActive: selectedConversationType === ConversationType.ALL,
    },
    {
      key: ConversationType.FAVORITES,
      label: "Favorites",
      isActive: selectedConversationType === ConversationType.FAVORITES,
    },
    {
      key: ConversationType.GROUPS,
      label: "Groups",
      isActive: selectedConversationType === ConversationType.GROUPS,
    },
    {
      key: ConversationType.MUTED,
      label: "Muted",
      isActive: selectedConversationType === ConversationType.MUTED,
    },
  ];
};
