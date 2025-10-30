import { useState } from "react";
import type { GestureResponderEvent } from "react-native";

export const useContextMenu = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openAtEvent = (e: GestureResponderEvent) => {
    const { pageX, pageY } = e.nativeEvent;
    setPosition({ x: pageX, y: pageY });
    setVisible(true);
  };

  const close = () => setVisible(false);

  return { visible, position, openAtEvent, close, setPosition };
};
