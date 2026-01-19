import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { ScrollView } from "react-native";
import { calculateThumbnailScrollOffset, THUMBNAIL } from "@/utils/mediaUtils";

export const useKeyboardNavigation = (
  visible: boolean,
  onClose: () => void,
  onPrevious: () => void,
  onNext: () => void
): void => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!visible) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          onPrevious();
          break;
        case "ArrowRight":
          onNext();
          break;
      }
    },
    [visible, onClose, onPrevious, onNext]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

interface UseThumbnailScrollOptions {
  thumbnailSize?: number;
}

export const useThumbnailScroll = (
  scrollRef: React.RefObject<ScrollView | null>,
  currentIndex: number,
  itemCount: number,
  options: UseThumbnailScrollOptions = {}
): void => {
  const { thumbnailSize = THUMBNAIL.SIZE_WEB } = options;

  useEffect(() => {
    if (!scrollRef.current || itemCount <= 1) return;

    const offset = calculateThumbnailScrollOffset(currentIndex, thumbnailSize);
    scrollRef.current.scrollTo({ x: offset, animated: true });
  }, [currentIndex, itemCount, scrollRef, thumbnailSize]);
};

interface ImagePreviewState {
  currentIndex: number;
  setCurrentIndex: Dispatch<SetStateAction<number>>;
  handlePrevious: () => void;
  handleNext: () => void;
  handleSelectIndex: (index: number) => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const useImagePreviewNavigation = (
  currentIndex: number,
  setCurrentIndex: Dispatch<SetStateAction<number>>,
  totalCount: number,
  options: { wrapNavigation?: boolean; onNavigate?: () => void } = {}
): Omit<ImagePreviewState, "currentIndex" | "setCurrentIndex"> => {
  const { wrapNavigation = false, onNavigate } = options;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) return prev - 1;
      return wrapNavigation ? totalCount - 1 : prev;
    });
    onNavigate?.();
  }, [totalCount, wrapNavigation, setCurrentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < totalCount - 1) return prev + 1;
      return wrapNavigation ? 0 : prev;
    });
    onNavigate?.();
  }, [totalCount, wrapNavigation, setCurrentIndex, onNavigate]);

  const handleSelectIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onNavigate?.();
    },
    [setCurrentIndex, onNavigate]
  );

  return {
    handlePrevious,
    handleNext,
    handleSelectIndex,
    canGoPrevious: currentIndex > 0,
    canGoNext: currentIndex < totalCount - 1,
  };
};
