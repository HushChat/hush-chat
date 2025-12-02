import { useState, useEffect, useRef, RefObject } from "react";
import { View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";

interface DragAndDropOptions {
  onDropFiles?: (files: File[]) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDrop?: (e: DragEvent) => void;
}

export const useDragAndDrop = <T extends View | unknown>(
  ref: RefObject<T>,
  options: DragAndDropOptions = {}
) => {
  const { onDropFiles, onDragEnter, onDragLeave, onDrop } = options;
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    if (!PLATFORM.IS_WEB || !ref.current) return;

    const element = ref.current as unknown as HTMLElement;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;

      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
      if (onDragEnter) onDragEnter(e);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (onDragLeave) onDragLeave(e);

      const relatedTarget = e.relatedTarget as Node | null;

      if (!element.contains(relatedTarget)) {
        setIsDragging(false);
        dragCounter.current = 0;
        return;
      }

      dragCounter.current -= 1;
      if (dragCounter.current <= 0) {
        setIsDragging(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (onDrop) onDrop(e);

      if (
        onDropFiles &&
        e.dataTransfer &&
        e.dataTransfer.files &&
        e.dataTransfer.files.length > 0
      ) {
        const filesArray = Array.from(e.dataTransfer.files);
        onDropFiles(filesArray);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget && (e.clientX === 0 || e.clientY === 0)) {
        setIsDragging(false);
        dragCounter.current = 0;
      }
    };

    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("dragleave", handleDragLeave);
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("drop", handleDrop);
    window.addEventListener("dragleave", handleWindowDragLeave);

    return () => {
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragleave", handleDragLeave);
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragleave", handleWindowDragLeave);
    };
  }, [ref, onDropFiles, onDragEnter, onDragLeave, onDrop]);

  return { isDragging };
};
