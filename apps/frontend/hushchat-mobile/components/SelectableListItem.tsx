import React from "react";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { ListItem } from "@/components/ui/ListItem";

interface SelectableListItemProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  isSelected: boolean;
  onToggle: () => void;
}

export const SelectableListItem = ({
  title,
  subtitle,
  imageUrl,
  isSelected,
  onToggle,
}: SelectableListItemProps) => (
  <ListItem
    leading={<InitialsAvatar name={title} imageUrl={imageUrl} />}
    title={title}
    subtitle={
      subtitle ? (
        <AppText className="text-gray-600 dark:text-text-secondary-dark text-sm" numberOfLines={1}>
          {subtitle}
        </AppText>
      ) : undefined
    }
    trailing={
      isSelected ? <Ionicons name="checkmark-circle" size={20} color="#6B4EFF" /> : undefined
    }
    onPress={onToggle}
    selected={isSelected}
  />
);
