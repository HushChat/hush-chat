import React, { useEffect, useState, useRef } from "react";
import { ViewStyle } from "react-native";
import { MotionView } from "@/motion/MotionView";
import { MotionConfig } from "@/motion/config";

interface IHighlightWrapperProps {
  id: number | string;
  targetId?: number | string | null;
  children: React.ReactNode;
  style?: ViewStyle;
  bounceDistance?: number;
  onHighlightComplete?: () => void;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  id,
  targetId,
  children,
  style,
  bounceDistance = 12,
  onHighlightComplete,
}) => {
  const [isBouncing, setIsBouncing] = useState(false);

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (id !== targetId) {
      hasTriggeredRef.current = false;
      return;
    }

    if (id === targetId && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      setIsBouncing(true);
      const timer = setTimeout(() => {
        setIsBouncing(false);
        if (onHighlightComplete) {
          onHighlightComplete();
        }
      }, MotionConfig.duration.md);

      return () => clearTimeout(timer);
    }
  }, [id, targetId, onHighlightComplete]);

  return (
    <MotionView
      visible={true}
      style={style}
      animate={{ translateY: isBouncing ? bounceDistance : 0 }}
      duration={MotionConfig.duration.md}
      easing="emphasized"
    >
      {children}
    </MotionView>
  );
};
