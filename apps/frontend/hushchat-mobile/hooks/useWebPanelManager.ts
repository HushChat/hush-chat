import { useCallback, useEffect, useMemo, useState } from "react";
import { PanelType } from "@/types/web-panel/types";

const PANEL_CONFIG = {
  WIDTH_RATIO: 0.3,
  MIN_WIDTH: 300,
  MAX_WIDTH: 400,
} as const;

const useWebPanelManager = (screenWidth: number) => {
  const [activePanel, setActivePanel] = useState<PanelType>(PanelType.NONE);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelContentReady, setIsPanelContentReady] = useState(false);

  const panelWidth = useMemo(() => {
    const calculated = screenWidth * PANEL_CONFIG.WIDTH_RATIO;
    return Math.min(Math.max(calculated, PANEL_CONFIG.MIN_WIDTH), PANEL_CONFIG.MAX_WIDTH);
  }, [screenWidth]);

  useEffect(() => {
    if (activePanel !== PanelType.NONE) {
      setIsPanelOpen(true);
      // Delay content visibility for staggered animation effect
      const timer = setTimeout(() => setIsPanelContentReady(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsPanelContentReady(false);
      // Delay panel close to allow content fade out first
      const timer = setTimeout(() => setIsPanelOpen(false), 150);
      return () => clearTimeout(timer);
    }
  }, [activePanel]);

  const openPanel = useCallback((panelType: PanelType) => {
    setActivePanel(panelType);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(PanelType.NONE);
  }, []);

  const togglePanel = useCallback((panelType: PanelType) => {
    setActivePanel((current) => (current === panelType ? PanelType.NONE : panelType));
  }, []);

  return {
    activePanel,
    isPanelOpen,
    isPanelContentReady,
    panelWidth,
    openPanel,
    closePanel,
    togglePanel,
  };
};

export default useWebPanelManager;
