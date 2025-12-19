import { useCallback, useState } from "react";
import { copyToClipboard, normalizeUrl } from "@/utils/messageUtils";

export const useWebContextMenu = () => {
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedUrl, setSelectedUrl] = useState<string>("");

  const openMenu = useCallback((e: any, url: string) => {
    e.preventDefault();
    setMenuPos({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
    setSelectedUrl(url);
    setMenuVisible(true);
  }, []);

  const closeMenu = useCallback(() => setMenuVisible(false), []);

  const copyLink = useCallback(async () => {
    const finalUrl = normalizeUrl(selectedUrl);
    if (finalUrl) await copyToClipboard(finalUrl);
    closeMenu();
  }, [selectedUrl, closeMenu]);

  return {
    menuVisible,
    menuPos,
    openMenu,
    closeMenu,
    copyLink,
  };
};
