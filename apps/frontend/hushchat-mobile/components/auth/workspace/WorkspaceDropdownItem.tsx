import { Ionicons } from "@expo/vector-icons";
import { View, Text, Pressable } from "react-native";
import { Workspace } from "@/types/login/types";

const WorkspaceStatusBadge = ({ status }: { status: string }) => {
  const isPending = status === "PENDING";

  const badgeStyle = isPending
    ? "bg-amber-100 dark:bg-amber-900/30"
    : "bg-emerald-100 dark:bg-emerald-900/30";

  const textStyle = isPending
    ? "text-amber-700 dark:text-amber-400"
    : "text-emerald-700 dark:text-emerald-400";

  return (
    <View className={`${badgeStyle} px-1.5 py-[1px] rounded-full`}>
      <Text className={`${textStyle} text-[10px] font-medium`}>
        {isPending ? "Invitation Pending" : "Active"}
      </Text>
    </View>
  );
};

type SizeTokens = Record<string, any>;

type WorkspaceDropdownItemProps = {
  item: Workspace;
  isSelected: boolean;
  onSelect: (workspace: Workspace) => void;
  isLast: boolean;
  tokens: SizeTokens;
};

const WorkspaceDropdownItem = ({
  item,
  isSelected,
  onSelect,
  isLast,
  tokens,
}: WorkspaceDropdownItemProps) => {
  const PRIMARY_COLOR = "#2196F3";
  const SELECTED_BACKGROUND = "bg-blue-50 dark:bg-blue-900/20";
  const BASE_BACKGROUND = "bg-white dark:bg-gray-900";

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? (isSelected ? "#BDE2FF" : "#EDEDED") : undefined,
      })}
      className={`px-3 py-2.5 border-b border-gray-200 dark:border-gray-700
        ${isSelected ? SELECTED_BACKGROUND : BASE_BACKGROUND}
        ${isLast ? "border-b-0" : ""}`}
      onPress={() => onSelect(item)}
    >
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text
            className={`${tokens.font} text-[14px] font-medium text-gray-900 dark:text-gray-100`}
          >
            {item.name}
          </Text>

          {item.description && (
            <Text
              numberOfLines={1}
              className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5 mb-1"
            >
              {item.description}
            </Text>
          )}

          <WorkspaceStatusBadge status={item.status} />
        </View>

        {isSelected && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />}
      </View>
    </Pressable>
  );
};

export default WorkspaceDropdownItem;
