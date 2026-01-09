import { useCallback, useRef, useState } from "react";

interface UseResizeHandleReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
}

export function useResizeHandle(onResize: (deltaY: number) => void): UseResizeHandleReturn {
  const [isDragging, setIsDragging] = useState(false);
  const lastYRef = useRef(0);

  const handleMove = useCallback(
    (clientY: number) => {
      const deltaY = lastYRef.current - clientY;
      onResize(deltaY);
      lastYRef.current = clientY;
    },
    [onResize]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientY);
    },
    [handleMove]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientY);
      }
    },
    [handleMove]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleEnd);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleEnd);
  }, [handleMouseMove, handleTouchMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      lastYRef.current = e.clientY;
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
    },
    [handleMouseMove, handleEnd]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      lastYRef.current = e.touches[0].clientY;
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleEnd);
    },
    [handleTouchMove, handleEnd]
  );

  return {
    isDragging,
    handleMouseDown,
    handleTouchStart,
  };
}
