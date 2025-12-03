import { ConversationType } from "@/types/chat/types";

const conversationCriteriaMap: Record<ConversationType, () => object> = {
  [ConversationType.ARCHIVED]: () => ({ isArchived: true }),
  [ConversationType.FAVORITES]: () => ({ isFavorite: true }),
  [ConversationType.UNREAD]: () => ({ isUnread: true }),
  [ConversationType.GROUP]: () => ({ isGroup: true }),
  [ConversationType.ALL]: () => ({}),
};

const getCriteria = (types: ConversationType | ConversationType[]) => {
  const typeList = Array.isArray(types) ? types : [types];

  return typeList.reduce((criteria, type) => {
    return { ...criteria, ...(conversationCriteriaMap[type]?.() || {}) };
  }, {});
};

export { getCriteria };
