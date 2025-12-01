/**
 * useAutoHeight
 *
 * Manages auto-resizing height animation for the message input.
 */

import { useCallback, useMemo, useState } from "react";
import { TextInputContentSizeChangeEvent } from "react-native";
import { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { PLATFORM } from "@/constants/platformConstants";
import {
  ANIM_EASING,
  RESIZE_ANIM_MS,
  RESET_ANIM_MS,
  WEB_MAX_CONTAINER_PX,
  WEB_MIN_CONTAINER_PX,
} from "@/constants/composerConstants";

interface UseAutoHeightOptions {
  minLines: number;
  maxLines: number;
  lineHeight: number;
  verticalPadding: number;
}

interface UseAutoHeightReturn {
  inputHeight: number;
  minHeight: number;
  maxHeight: number;
  animatedContainerStyle: ReturnType<typeof useAnimatedStyle>;
  handleContentSizeChange: (e: TextInputContentSizeChangeEvent) => void;
  resetHeight: (callback?: () => void) => void;
  updateHeightForText: (text: string) => void;
}

export function useAutoHeight({
  minLines,
  maxLines,
  lineHeight,
  verticalPadding,
}: UseAutoHeightOptions): UseAutoHeightReturn {
  const minHeight = useMemo(() => {
    const base = lineHeight * minLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(base, WEB_MIN_CONTAINER_PX) : base;
  }, [lineHeight, minLines, verticalPadding]);

  const maxHeight = useMemo(() => {
    const base = lineHeight * maxLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(base, WEB_MAX_CONTAINER_PX) : base;
  }, [lineHeight, maxLines, verticalPadding]);

  const initialHeight = useMemo(
    () => lineHeight * minLines + verticalPadding,
    [lineHeight, minLines, verticalPadding]
  );

  const [inputHeight, setInputHeight] = useState<number>(initialHeight);
  const animatedHeight = useSharedValue(initialHeight);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  const handleContentSizeChange = useCallback(
    (e: TextInputContentSizeChangeEvent) => {
      const next = Math.ceil(e.nativeEvent.contentSize.height);
      const clamped = Math.max(minHeight, Math.min(maxHeight, next));
      setInputHeight(clamped);
      animatedHeight.value = withTiming(clamped, {
        duration: RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });
    },
    [minHeight, maxHeight, animatedHeight]
  );

  const resetHeight = useCallback(
    (callback?: () => void) => {
      animatedHeight.value = withTiming(
        minHeight,
        { duration: RESET_ANIM_MS, easing: ANIM_EASING },
        (finished) => {
          if (finished) {
            scheduleOnRN(() => {
              setInputHeight(minHeight);
              callback?.();
            });
          }
        }
      );
    },
    [minHeight, animatedHeight]
  );

  const updateHeightForText = useCallback(
    (text: string) => {
      if (text.trim().length === 0) {
        setInputHeight(minHeight);
        animatedHeight.value = withTiming(minHeight, {
          duration: RESIZE_ANIM_MS,
          easing: ANIM_EASING,
        });
      }
    },
    [minHeight, animatedHeight]
  );

  return {
    inputHeight,
    minHeight,
    maxHeight,
    animatedContainerStyle,
    handleContentSizeChange,
    resetHeight,
    updateHeightForText,
  };
}
