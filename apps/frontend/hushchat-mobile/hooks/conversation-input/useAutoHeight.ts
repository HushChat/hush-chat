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
  currentMaxHeight: number;
  animatedHeightStyle: AnimatedViewStyle;
  handleTextContainerSizeChange: (event: TextInputContentSizeChangeEvent) => void;
  animateHeightResetToMinimum: (onComplete?: () => void) => void;
  updateHeightForTextChange: (textValue: string) => void;
  handleManualResize: (deltaY: number) => void;
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

  const absoluteMaximumHeight = useMemo(() => {
    return 400;
  }, []);

  const initialHeightValue = useMemo(
    () => lineHeight * minLines + verticalPadding,
    [lineHeight, minLines, verticalPadding]
  );

  const [currentInputHeight, setCurrentInputHeight] = useState<number>(initialHeightValue);
  const [currentMaxHeight, setCurrentMaxHeight] = useState<number>(maximumInputHeight);
  const animatedHeightValue = useSharedValue(initialHeightValue);
  const contentSizeRef = useRef<number>(initialHeightValue);
  const isResettingRef = useRef<boolean>(false);

  const animatedHeightStyle: AnimatedStyle<ViewStyle> = useAnimatedStyle(() => ({
    height: animatedHeightValue.value,
  }));

  const updateHeight = useCallback(
    (newHeight: number, isManual: boolean = false) => {
      const maxHeight = isManual ? absoluteMaximumHeight : currentMaxHeight;
      const clampedHeight = Math.max(minimumInputHeight, Math.min(maxHeight, newHeight));

      setCurrentInputHeight(clampedHeight);
      animatedHeightValue.value = withTiming(clampedHeight, {
        duration: isManual ? 0 : RESIZE_ANIM_MS,
        easing: ANIM_EASING,
      });

      contentSizeRef.current = clampedHeight;
    },
    [minimumInputHeight, currentMaxHeight, absoluteMaximumHeight, animatedHeightValue]
  );

  const handleTextContainerSizeChange = useCallback(
    (event: TextInputContentSizeChangeEvent) => {
      if (isResettingRef.current) return;

      const rawMeasuredHeight = Math.ceil(event.nativeEvent.contentSize.height);
      updateHeight(rawMeasuredHeight, false);
    },
    [updateHeight]
  );

  const updateHeightForTextChange = useCallback(
    (textValue: string) => {
      if (textValue.trim().length === 0) {
        updateHeight(minimumInputHeight, false);
        setCurrentMaxHeight(maximumInputHeight);
      }
    },
    [minimumInputHeight, maximumInputHeight, updateHeight]
  );

  const animateHeightResetToMinimum = useCallback(
    (onComplete?: () => void) => {
      isResettingRef.current = true;
      setCurrentMaxHeight(maximumInputHeight);

      animatedHeightValue.value = minimumInputHeight;

      setCurrentInputHeight(minimumInputHeight);
      contentSizeRef.current = minimumInputHeight;

      isResettingRef.current = false;
      onComplete?.();
    },
    [minimumInputHeight, maximumInputHeight, animatedHeightValue]
  );

  const handleManualResize = useCallback(
    (deltaY: number) => {
      const newHeight = contentSizeRef.current + deltaY;
      const clampedHeight = Math.max(
        minimumInputHeight,
        Math.min(absoluteMaximumHeight, newHeight)
      );

      setCurrentInputHeight(clampedHeight);
      setCurrentMaxHeight(clampedHeight);
      animatedHeightValue.value = clampedHeight;
      contentSizeRef.current = clampedHeight;
    },
    [minimumInputHeight, absoluteMaximumHeight, animatedHeightValue]
  );

  return {
    currentInputHeight,
    minimumInputHeight,
    maximumInputHeight,
    currentMaxHeight,
    animatedHeightStyle,
    handleTextContainerSizeChange,
    animateHeightResetToMinimum,
    updateHeightForTextChange,
    handleManualResize,
  };
}
