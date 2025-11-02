import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type TKebabMenuButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  color?: string;
  size?: number;
};

const KebabMenuButton = ({ onPress, color = "#6B7280", size = 24 }: TKebabMenuButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} className="ml-3">
      <Ionicons name="ellipsis-vertical" size={size} color={color} />
    </TouchableOpacity>
  );
};

export default KebabMenuButton;
