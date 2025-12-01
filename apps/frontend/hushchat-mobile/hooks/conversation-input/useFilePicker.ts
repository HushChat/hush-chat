/**
 * useFilePicker
 *
 * Handles file selection, validation, and upload for web and native platforms.
 */

import React, { useCallback, useRef, useState, useMemo } from "react";
import { View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { validateFiles } from "@/utils/fileValidation";
import { ToastUtils } from "@/utils/toastUtils";
import { getConversationMenuOptions } from "@/components/conversations/conversation-thread/composer/menuOptions";

interface MenuPosition {
  x: number;
  y: number;
}

interface UseFilePickerOptions {
  onFilesSelected?: (files: File[]) => void;
  onOpenNativePicker?: () => void;
}

interface UseFilePickerReturn {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  addButtonRef: React.RefObject<View | null>;
  menuVisible: boolean;
  menuPosition: MenuPosition;
  menuOptions: ReturnType<typeof getConversationMenuOptions>;
  handleAddButtonPress: () => void;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeMenu: () => void;
  handleMenuOptionSelect: (fn: () => Promise<void> | void) => Promise<void>;
}

export function useFilePicker({
  onFilesSelected,
  onOpenNativePicker,
}: UseFilePickerOptions): UseFilePickerReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addButtonRef = useRef<View>(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const menuOptions = useMemo(() => getConversationMenuOptions(fileInputRef), [fileInputRef]);

  const handleAddButtonPress = useCallback(() => {
    if (PLATFORM.IS_WEB) {
      const element = addButtonRef.current as unknown as {
        getBoundingClientRect?: () => DOMRect;
      } | null;

      if (element?.getBoundingClientRect) {
        const rect = element.getBoundingClientRect();
        setMenuPosition({ x: rect.left, y: rect.bottom + 8 });
      } else {
        setMenuPosition({ x: 0, y: 0 });
      }
      setMenuVisible(true);
      return;
    }

    onOpenNativePicker?.();
  }, [onOpenNativePicker]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      if (files && files.length > 0) {
        const { errors, validFiles } = validateFiles(files);

        errors.forEach((err) => ToastUtils.error(err));

        if (validFiles.length > 0) {
          onFilesSelected?.(validFiles);
        }
      }
      event.target.value = "";
    },
    [onFilesSelected]
  );

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  const handleMenuOptionSelect = useCallback(async (fn: () => Promise<void> | void) => {
    try {
      await fn();
    } catch {
      ToastUtils.error("Error with file selection");
    } finally {
      setMenuVisible(false);
    }
  }, []);

  return {
    fileInputRef,
    addButtonRef,
    menuVisible,
    menuPosition,
    menuOptions,
    handleAddButtonPress,
    handleFileChange,
    closeMenu,
    handleMenuOptionSelect,
  };
}
