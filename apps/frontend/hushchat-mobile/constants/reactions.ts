import { ReactionType } from "@/types/chat/types";

export const REACTION_META: Record<ReactionType, { emoji: string; label: string }> = {
  [ReactionType.THUMBS_UP]: { emoji: "👍", label: "Like" },
  [ReactionType.LOVE]: { emoji: "❤️", label: "Love" },
  [ReactionType.HAHA]: { emoji: "😂", label: "Haha" },
  [ReactionType.WOW]: { emoji: "😮", label: "Wow" },
  [ReactionType.ANGRY]: { emoji: "😠", label: "Angry" },
  [ReactionType.SAD]: { emoji: "😢", label: "Sad" },
};
