import { useEffect } from "react";
import { PLATFORM } from "@/constants/platformConstants";

type UsePasteHandlerOptions = {
  enabled: boolean;
  onPasteFiles: (files: File[]) => void;
};

export function usePasteHandler({ enabled, onPasteFiles }: UsePasteHandlerOptions) {
  useEffect(() => {
    if (!PLATFORM.IS_WEB || !enabled) return;

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

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [enabled, onPasteFiles]);
}
