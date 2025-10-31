import { useState, useEffect } from "react";
import { PLATFORM } from "@/constants/platformConstants";

type UseKeyboardNavigationProps<T> = {
  items: T[];
  onSelect?: (item: T, index: number) => void;
  onClose?: () => void;
  enabled?: boolean;
};

export function useKeyboardNavigation<T>({
  items,
  onSelect,
  onClose,
  enabled = true,
}: UseKeyboardNavigationProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (!enabled || !PLATFORM.IS_WEB) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (items.length === 0) return;

      let handled = false;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex((current) => {
            const next = current + 1;
            return next >= items.length ? 0 : next;
          });
          handled = true;
          break;

        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex((current) => {
            const prev = current - 1;
            return prev < 0 ? items.length - 1 : prev;
          });
          handled = true;
          break;

        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          if (items[activeIndex]) {
            onSelect?.(items[activeIndex], activeIndex);
          }
          handled = true;
          break;

        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose?.();
          handled = true;
          break;

        case "Home":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex(0);
          handled = true;
          break;

        case "End":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex(items.length - 1);
          handled = true;
          break;

        case "Tab":
          e.preventDefault();
          e.stopPropagation();
          if (items[activeIndex]) {
            onSelect?.(items[activeIndex], activeIndex);
          }
          handled = true;
          break;
      }

      if (handled) {
        return false;
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [enabled, items, activeIndex, onSelect, onClose]);

  return {
    activeIndex,
    setActiveIndex,
  };
}
