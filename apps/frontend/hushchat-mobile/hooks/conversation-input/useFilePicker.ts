import React, { useCallback, useRef, useState, useMemo } from "react";
import { View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import { validateFiles } from "@/utils/fileValidation";
import { ToastUtils } from "@/utils/toastUtils";
import { getConversationMenuOptions } from "@/components/conversations/conversation-thread/composer/menuOptions";

type TMenuCoordinates = {
  x: number;
  y: number;
};

type TFilePickerOptions = {
  onFilesSelected?: (selectedFiles: File[]) => void;
  onOpenNativePicker?: () => void;
};

interface IFilePickerReturn {
  fileInputElementRef: React.RefObject<HTMLInputElement | null>;
  fileActionButtonRef: React.RefObject<View | null>;
  isMenuOpen: boolean;
  menuScreenCoordinates: TMenuCoordinates;
  menuActionOptions: ReturnType<typeof getConversationMenuOptions>;
  handleFileActionButtonPress: () => void;
  handleFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  closeFileActionMenu: () => void;
  executeMenuOption: (callback: () => Promise<void> | void) => Promise<void>;
}

export function useFilePicker({
  onFilesSelected,
  onOpenNativePicker,
}: TFilePickerOptions): IFilePickerReturn {
  const fileInputElementRef = useRef<HTMLInputElement>(null);
  const fileActionButtonRef = useRef<View>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuScreenCoordinates, setMenuScreenCoordinates] = useState<TMenuCoordinates>({
    x: 0,
    y: 0,
  });

  const menuActionOptions = useMemo(
    () => getConversationMenuOptions(fileInputElementRef),
    [fileInputElementRef]
  );

  const handleFileActionButtonPress = useCallback(() => {
    if (PLATFORM.IS_WEB) {
      const element = fileActionButtonRef.current as unknown as {
        getBoundingClientRect?: () => DOMRect;
      } | null;

      if (element?.getBoundingClientRect) {
        const { left, bottom } = element.getBoundingClientRect();

        setMenuScreenCoordinates({
          x: left,
          y: bottom + 8,
        });
      } else {
        setMenuScreenCoordinates({
          x: 0,
          y: 0,
        });
      }

      setIsMenuOpen(true);
      return;
    }

    onOpenNativePicker?.();
  }, [onOpenNativePicker]);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = event.target.files;

      if (selectedFiles && selectedFiles.length > 0) {
        const { errors, validFiles } = validateFiles(selectedFiles);

        errors.forEach((errorMessage) => ToastUtils.error(errorMessage));

        if (validFiles.length > 0) {
          onFilesSelected?.(validFiles);
        }
      }

      event.target.value = "";
    },
    [onFilesSelected]
  );

  const closeFileActionMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const executeMenuOption = useCallback(async (callback: () => Promise<void> | void) => {
    try {
      await callback();
    } catch {
      ToastUtils.error("Error performing file action");
    } finally {
      setIsMenuOpen(false);
    }
  }, []);

  return {
    fileInputElementRef,
    fileActionButtonRef,
    isMenuOpen,
    menuScreenCoordinates,
    menuActionOptions,
    handleFileActionButtonPress,
    handleFileInputChange,
    closeFileActionMenu,
    executeMenuOption,
  };
}
