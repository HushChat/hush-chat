import { useMemo } from "react";
import { ActionOption } from "@/components/conversations/conversation-info-panel/common/ActionList"; // Adjust path

interface UseChatActionOptionsProps {
  isPinned: boolean;
  isFavorite: boolean;
  isMuted: boolean;

  // Handlers (Optional - if undefined, the option won't appear)
  onTogglePin?: () => void;
  onToggleFavorite?: () => void;
  onToggleMute?: () => void;
  onDelete?: () => void;
}

export const useChatActionOptions = ({
  isPinned,
  isFavorite,
  isMuted,
  onTogglePin,
  onToggleFavorite,
  onToggleMute,
  onDelete,
}: UseChatActionOptionsProps): ActionOption[] => {
  return useMemo(() => {
    const options: ActionOption[] = [];

    // 1. PIN
    if (onTogglePin) {
      options.push({
        id: "pin",
        name: isPinned ? "Unpin Conversation" : "Pin Conversation",
        iconName: isPinned ? "pin-outline" : "pin",
        action: onTogglePin,
        showIn: ["all"],
      });
    }

    // 2. FAVORITE
    if (onToggleFavorite) {
      options.push({
        id: "favorite",
        name: isFavorite ? "Remove from Favorites" : "Add to Favorites",
        iconName: isFavorite ? "heart" : "heart-outline",
        action: onToggleFavorite,
      });
    }

    // 3. MUTE
    if (onToggleMute) {
      options.push({
        id: "mute",
        name: isMuted ? "Unmute Conversation" : "Mute Conversation",
        iconName: isMuted ? "notifications-off-outline" : "notifications-outline",
        action: onToggleMute,
      });
    }

    // 4. DELETE
    if (onDelete) {
      options.push({
        id: "delete",
        name: "Delete Conversation",
        iconName: "trash-bin-outline",
        action: onDelete,
        critical: true,
      });
    }

    return options;
  }, [isPinned, isFavorite, isMuted, onTogglePin, onToggleFavorite, onToggleMute, onDelete]);
};
