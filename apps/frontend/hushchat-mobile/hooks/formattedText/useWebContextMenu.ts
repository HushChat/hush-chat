import { useCallback, useState } from "react";
import { copyToClipboard, normalizeUrl } from "@/utils/messageUtils";

export const useWebContextMenu = () => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");

  const openMenu = useCallback((e: any, url: string, text: string = "") => {
    e.preventDefault();
    setMenuPos({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
    setSelectedUrl(url);
    setSelectedText(text);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const copyLink = useCallback(async () => {
    if (selectedUrl.startsWith("tel:") || selectedUrl.startsWith("mailto:")) {
      await copyToClipboard(selectedUrl);
      closeMenu();
      return;
    }

    const finalUrl = normalizeUrl(selectedUrl);
    if (finalUrl) await copyToClipboard(finalUrl);
    closeMenu();
  }, [selectedUrl, closeMenu]);

  const copyText = useCallback(async () => {
    if (selectedText) await copyToClipboard(selectedText);
    closeMenu();
  }, [selectedText, closeMenu]);

  return {
    menuVisible,
    menuPos,
    openMenu,
    closeMenu,
    copyLink,
    copyText,
  };
};
