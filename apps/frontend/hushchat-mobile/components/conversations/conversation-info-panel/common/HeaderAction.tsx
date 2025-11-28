import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderActionProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

export default function HeaderAction({ iconName, onPress, color = "#6B7280" }: HeaderActionProps) {
  return (
    <TouchableOpacity
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
      onPress={onPress}
    >
      <Ionicons name={iconName} size={20} color={color} />
    </TouchableOpacity>
  );
}
