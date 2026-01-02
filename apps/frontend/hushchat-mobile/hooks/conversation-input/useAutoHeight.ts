import { useCallback, useMemo, useState } from "react";
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
  updateHeightForClearedText: (textValue: string) => void;
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

  const animatedHeightStyle: AnimatedStyle<ViewStyle> = useAnimatedStyle(() => ({
    height: animatedHeightValue.value,
  }));

  const handleTextContainerSizeChange = useCallback(
    (event: TextInputContentSizeChangeEvent) => {
      const rawMeasuredHeight = Math.ceil(event.nativeEvent.contentSize.height);

      const nextHeight = Math.max(
        minimumInputHeight,
        Math.min(maximumInputHeight, rawMeasuredHeight)
      );

      setCurrentInputHeight(nextHeight);

      animatedHeightValue.value = withTiming(nextHeight, {
        duration: RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });
    },
    [minimumInputHeight, maximumInputHeight, animatedHeightValue]
  );

  const animateHeightResetToMinimum = useCallback(
    (onComplete?: () => void) => {
      animatedHeightValue.value = withTiming(minimumInputHeight, {
        duration: RESET_ANIM_MS,
        easing: ANIM_EASING,
      });

      setCurrentInputHeight(minimumInputHeight);

      if (onComplete) {
        setTimeout(onComplete, RESET_ANIM_MS);
      }
    },
    [minimumInputHeight, animatedHeightValue]
  );

  const updateHeightForClearedText = useCallback(
    (textValue: string) => {
      if (textValue.trim().length === 0) {
        setCurrentInputHeight(minimumInputHeight);

        animatedHeightValue.value = withTiming(minimumInputHeight, {
          duration: RESIZE_ANIM_MS,
          easing: ANIM_EASING,
        });
        return;
      }

      const lineCount = textValue.split("\n").length;
      const calculatedHeight = lineHeight * lineCount + verticalPadding;
      const nextHeight = Math.max(
        minimumInputHeight,
        Math.min(maximumInputHeight, calculatedHeight)
      );

      setCurrentInputHeight(nextHeight);

      animatedHeightValue.value = withTiming(nextHeight, {
        duration: RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });
    },
    [minimumInputHeight, maximumInputHeight, lineHeight, verticalPadding, animatedHeightValue]
  );

  return {
    currentInputHeight,
    minimumInputHeight,
    maximumInputHeight,
    animatedHeightStyle,
    handleTextContainerSizeChange,
    animateHeightResetToMinimum,
    updateHeightForClearedText,
  };
}
