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
  initialDelay?: number;
}

export const MessageHighlightWrapper: React.FC<IHighlightWrapperProps> = ({
  id,
  targetId,
  children,
  style,
  bounceDistance = 12,
  onHighlightComplete,
  initialDelay = 300,
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

      const delayTimer = setTimeout(() => {
        setIsBouncing(true);

        const bounceTimer = setTimeout(() => {
          setIsBouncing(false);
          if (onHighlightComplete) {
            onHighlightComplete();
          }
        }, MotionConfig.duration.md);

        return () => clearTimeout(bounceTimer);
      }, initialDelay);

      return () => clearTimeout(delayTimer);
    }
  }, [id, targetId, onHighlightComplete, initialDelay]);

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
