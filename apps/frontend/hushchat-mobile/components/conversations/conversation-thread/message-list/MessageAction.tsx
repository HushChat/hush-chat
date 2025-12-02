import { GestureResponderEvent, Pressable, ViewStyle } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import classNames from "classnames";

interface ActionIconProps {
  onPress: (event: GestureResponderEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
}

export const MessageAction: React.FC<ActionIconProps> = ({
  onPress,
  children,
  disabled,
  style,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className={classNames({
      "opacity-0 group-hover:opacity-100 hover:opacity-100": PLATFORM.IS_WEB,
      "opacity-100": !PLATFORM.IS_WEB,
    })}
    style={({ pressed }) => ({
      minWidth: 24,
      minHeight: 24,
      opacity: pressed ? 0.7 : 1,
      cursor: "pointer" as const,
      ...style,
    })}
  >
    {children}
  </Pressable>
);
