import { Ionicons } from "@expo/vector-icons";
import { View, ViewProps } from "react-native";
import ActionItem from "@/components/conversations/conversation-info-panel/common/ActionItem";

export type ApplyArea = "all" | "group-info" | "conversation-list";

export interface ActionOption {
  id: string | number;
  name: string;
  iconName: keyof typeof Ionicons.glyphMap;
  action: () => void;
  critical?: boolean;
  showIn?: ApplyArea[];
}

interface ActionListProps extends ViewProps {
  options: ActionOption[];
  area?: ApplyArea;
}

export default function ActionList({ options, area = "all", ...viewProps }: ActionListProps) {
  // 3. Filter the options based on the current area
  const visibleOptions = options.filter((option) => {
    // If option has no specific scope, assume it shows everywhere ('all')
    const allowedAreas = option.showIn || ["all"];

    // Always show if the item is marked for 'all'
    if (allowedAreas.includes("all")) return true;

    // Otherwise, check if the current component area matches the allowed areas
    return allowedAreas.includes(area);
  });

  if (visibleOptions.length === 0) return null;

  return (
    <View {...viewProps}>
      {visibleOptions.map((option) => (
        <ActionItem
          key={option.id}
          icon={option.iconName}
          label={option.name}
          onPress={option.action}
          color={option.critical ? "#EF4444" : undefined}
        />
      ))}
    </View>
  );
}
