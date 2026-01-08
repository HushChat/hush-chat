import { useEffect } from "react";
import { PLATFORM } from "@/constants/platformConstants";

type UsePasteHandlerOptions = {
  enabled: boolean;
  onPasteFiles: (files: File[]) => void;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
};

export function usePasteHandler({ enabled, onPasteFiles, inputRef }: UsePasteHandlerOptions) {
  useEffect(() => {
    if (!PLATFORM.IS_WEB || !enabled || !inputRef?.current) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }

      if (files.length > 0) {
        event.preventDefault();
        onPasteFiles(files);
      }
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener("paste", handlePaste);
    return () => inputElement?.removeEventListener("paste", handlePaste);
  }, [enabled, onPasteFiles, inputRef]);
}
