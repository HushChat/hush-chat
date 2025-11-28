import ActionItem from "@/components/conversations/conversation-info-panel/common/ActionItem";
import { View } from "react-native";
import { IActionConfig } from "@/types/chat/types";

interface ActionListProps {
  actions: IActionConfig[];
}

export default function ActionList({ actions }: ActionListProps) {
  return (
    <View>
      {actions.map((action, index) => (
        <ActionItem
          key={`${action.label}-${index}`}
          icon={action.icon}
          label={action.label}
          onPress={action.onPress}
          color={action.color}
          critical={action.critical}
        />
      ))}
    </View>
  );
}
