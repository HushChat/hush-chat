import { useCallback, useMemo, useState, useRef } from "react";
import { TextInputContentSizeChangeEvent, ViewStyle } from "react-native";
import {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  AnimatedStyle,
} from "react-native-reanimated";
import { PLATFORM } from "@/constants/platformConstants";
import {
  ANIM_EASING,
  RESIZE_ANIM_MS,
  RESET_ANIM_MS,
  WEB_MAX_CONTAINER_PX,
  WEB_MIN_CONTAINER_PX,
} from "@/constants/composerConstants";

type TAutoHeightOptions = {
  minLines: number;
  maxLines: number;
  lineHeight: number;
  verticalPadding: number;
};

type AnimatedViewStyle = AnimatedStyle<ViewStyle>;

interface IAutoHeightReturn {
  currentInputHeight: number;
  minimumInputHeight: number;
  maximumInputHeight: number;
  animatedHeightStyle: AnimatedViewStyle;
  handleTextContainerSizeChange: (event: TextInputContentSizeChangeEvent) => void;
  animateHeightResetToMinimum: (onComplete?: () => void) => void;
  updateHeightForTextChange: (textValue: string) => void;
}

export function useAutoHeight({
  minLines,
  maxLines,
  lineHeight,
  verticalPadding,
}: TAutoHeightOptions): IAutoHeightReturn {
  const minimumInputHeight = useMemo(() => {
    const rawHeight = lineHeight * minLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(rawHeight, WEB_MIN_CONTAINER_PX) : rawHeight;
  }, [lineHeight, minLines, verticalPadding]);

  const maximumInputHeight = useMemo(() => {
    const rawHeight = lineHeight * maxLines + verticalPadding;
    return PLATFORM.IS_WEB ? Math.max(rawHeight, WEB_MAX_CONTAINER_PX) : rawHeight;
  }, [lineHeight, maxLines, verticalPadding]);

  const initialHeightValue = useMemo(
    () => lineHeight * minLines + verticalPadding,
    [lineHeight, minLines, verticalPadding]
  );

  const [currentInputHeight, setCurrentInputHeight] = useState<number>(initialHeightValue);
  const animatedHeightValue = useSharedValue(initialHeightValue);
  const contentSizeRef = useRef<number>(initialHeightValue);
  const isResettingRef = useRef<boolean>(false);

  const animatedHeightStyle: AnimatedStyle<ViewStyle> = useAnimatedStyle(() => ({
    height: animatedHeightValue.value,
  }));

  const updateHeight = useCallback(
    (newHeight: number) => {
      const clampedHeight = Math.max(minimumInputHeight, Math.min(maximumInputHeight, newHeight));

      setCurrentInputHeight(clampedHeight);
      animatedHeightValue.value = withTiming(clampedHeight, {
        duration: RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });

      contentSizeRef.current = clampedHeight;
    },
    [minimumInputHeight, maximumInputHeight, animatedHeightValue]
  );

  const handleTextContainerSizeChange = useCallback(
    (event: TextInputContentSizeChangeEvent) => {
      if (isResettingRef.current) return;

      const rawMeasuredHeight = Math.ceil(event.nativeEvent.contentSize.height);
      updateHeight(rawMeasuredHeight);
    },
    [updateHeight]
  );

  const updateHeightForTextChange = useCallback(
    (textValue: string) => {
      if (textValue.trim().length === 0) {
        updateHeight(minimumInputHeight);
      }
    },
    [minimumInputHeight, updateHeight]
  );

  const animateHeightResetToMinimum = useCallback(
    (onComplete?: () => void) => {
      isResettingRef.current = true;

      animatedHeightValue.value = minimumInputHeight;

      setCurrentInputHeight(minimumInputHeight);
      contentSizeRef.current = minimumInputHeight;

      isResettingRef.current = false;
      onComplete?.();
    },
    [minimumInputHeight, animatedHeightValue]
  );

  return {
    currentInputHeight,
    minimumInputHeight,
    maximumInputHeight,
    animatedHeightStyle,
    handleTextContainerSizeChange,
    animateHeightResetToMinimum,
    updateHeightForTextChange,
  };
}
