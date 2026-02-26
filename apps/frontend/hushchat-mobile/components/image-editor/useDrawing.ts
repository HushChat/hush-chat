import { useCallback, useRef, useState } from "react";
import { DrawingTool, DrawPath } from "./types";
import { DEFAULT_COLOR, DEFAULT_TOOL, TOOL_CONFIG } from "./constants";

export function useDrawing() {
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [activeTool, setActiveTool] = useState<DrawingTool>(DEFAULT_TOOL);
  const [activeColor, setActiveColor] = useState(DEFAULT_COLOR);
  const currentPathRef = useRef<string[]>([]);
  const pathIdCounter = useRef(0);

  const startPath = useCallback((x: number, y: number) => {
    currentPathRef.current = [`M${x},${y}`];
  }, []);

  const addPoint = useCallback((x: number, y: number) => {
    currentPathRef.current.push(`L${x},${y}`);
  }, []);

  const endPath = useCallback(() => {
    if (currentPathRef.current.length < 2) {
      currentPathRef.current = [];
      return;
    }

    const config = TOOL_CONFIG[activeTool];
    const newPath: DrawPath = {
      id: `path-${pathIdCounter.current++}`,
      points: currentPathRef.current.join(" "),
      color: activeColor,
      strokeWidth: config.strokeWidth,
      opacity: config.opacity,
      tool: activeTool,
    };

    setPaths((prev) => [...prev, newPath]);
    currentPathRef.current = [];
  }, [activeTool, activeColor]);

  const undo = useCallback(() => {
    setPaths((prev) => prev.slice(0, -1));
  }, []);

  const clearAll = useCallback(() => {
    setPaths([]);
  }, []);

  const hasEdits = paths.length > 0;

  return {
    paths,
    activeTool,
    activeColor,
    setActiveTool,
    setActiveColor,
    startPath,
    addPoint,
    endPath,
    undo,
    clearAll,
    hasEdits,
    currentPathRef,
  };
}
