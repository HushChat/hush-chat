import { useCallback, useEffect, useMemo, useState } from "react";
import { useSharedValue, withTiming, Easing, type SharedValue } from "react-native-reanimated";
import { PanelType } from "@/types/web-panel/types";

const PANEL_CONFIG = {
  WIDTH_RATIO: 0.3,
  MIN_WIDTH: 300,
  MAX_WIDTH: 400,
} as const;

const useWebPanelManager = (screenWidth: number) => {
  const [activePanel, setActivePanel] = useState<PanelType>(PanelType.NONE);
  const [isPanelContentReady, setIsPanelContentReady] = useState(false);

  const widthAnim: SharedValue<number> = useSharedValue(0);
  const contentOpacity: SharedValue<number> = useSharedValue(0);

  const panelWidth = useMemo(() => {
    const calculated = screenWidth * PANEL_CONFIG.WIDTH_RATIO;
    return Math.min(Math.max(calculated, PANEL_CONFIG.MIN_WIDTH), PANEL_CONFIG.MAX_WIDTH);
  }, [screenWidth]);

  useEffect(() => {
    if (activePanel !== PanelType.NONE) {
      widthAnim.value = withTiming(panelWidth, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      contentOpacity.value = withTiming(1, { duration: 200 });
      setIsPanelContentReady(true);
    } else {
      contentOpacity.value = withTiming(0, { duration: 150 });
      widthAnim.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      setIsPanelContentReady(false);
    }
  }, [activePanel, panelWidth, widthAnim, contentOpacity]);

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
    isPanelContentReady,
    panelWidth,
    contentOpacity,
    widthAnim,
    openPanel,
    closePanel,
    togglePanel,
    isPanelOpen: activePanel !== PanelType.NONE,
  };
};

export default useWebPanelManager;
