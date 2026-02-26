import { DrawingTool } from "./types";

export const TOOL_COLORS = [
  "#FFFFFF",
  "#FF3B30",
  "#FF9500",
  "#FFCC00",
  "#34C759",
  "#007AFF",
  "#AF52DE",
  "#000000",
];

export const TOOL_CONFIG: Record<DrawingTool, { strokeWidth: number; opacity: number }> = {
  pen: { strokeWidth: 3, opacity: 1 },
  highlighter: { strokeWidth: 20, opacity: 0.4 },
};

export const DEFAULT_TOOL: DrawingTool = "pen";
export const DEFAULT_COLOR = "#FF3B30";
