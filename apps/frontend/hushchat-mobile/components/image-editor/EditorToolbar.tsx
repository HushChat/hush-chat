import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawingTool } from "./types";
import { TOOL_COLORS } from "./constants";
import { AppText } from "@/components/AppText";

type EditorToolbarProps = {
  activeTool: DrawingTool;
  activeColor: string;
  hasEdits: boolean;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onUndo: () => void;
  onClearAll: () => void;
};

const ToolButton = ({
  isActive,
  onPress,
  children,
}: {
  isActive: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.toolButton, isActive && styles.toolButtonActive]}
    className={`${isActive ? "bg-white/20" : ""}`}
  >
    {children}
  </Pressable>
);

const ColorDot = ({
  color,
  isActive,
  onPress,
}: {
  color: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.colorDotOuter}>
    <View
      style={[
        styles.colorDot,
        { backgroundColor: color },
        isActive && styles.colorDotActive,
        color === "#FFFFFF" && styles.colorDotWhiteBorder,
      ]}
    />
  </Pressable>
);

const EditorToolbar = ({
  activeTool,
  activeColor,
  hasEdits,
  onToolChange,
  onColorChange,
  onUndo,
  onClearAll,
}: EditorToolbarProps) => (
  <View style={styles.container}>
    <View style={styles.colorRow}>
      {TOOL_COLORS.map((color) => (
        <ColorDot
          key={color}
          color={color}
          isActive={color === activeColor}
          onPress={() => onColorChange(color)}
        />
      ))}
    </View>

    <View style={styles.toolRow}>
      <View style={styles.toolGroup}>
        <ToolButton isActive={activeTool === "pen"} onPress={() => onToolChange("pen")}>
          <MaterialCommunityIcons name="pen" size={22} color="#fff" />
          <AppText style={styles.toolLabel}>Pen</AppText>
        </ToolButton>

        <ToolButton
          isActive={activeTool === "highlighter"}
          onPress={() => onToolChange("highlighter")}
        >
          <MaterialCommunityIcons name="marker" size={22} color="#fff" />
          <AppText style={styles.toolLabel}>Highlight</AppText>
        </ToolButton>
      </View>

      <View style={styles.toolGroup}>
        <Pressable onPress={onUndo} disabled={!hasEdits} style={styles.actionButton}>
          <Ionicons name="arrow-undo" size={22} color={hasEdits ? "#fff" : "#555"} />
        </Pressable>

        <Pressable onPress={onClearAll} disabled={!hasEdits} style={styles.actionButton}>
          <AppText style={[styles.clearText, !hasEdits && styles.clearTextDisabled]}>
            Clear All
          </AppText>
        </Pressable>
      </View>
    </View>
  </View>
);

export default EditorToolbar;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  colorRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  colorDotOuter: {
    padding: 2,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  colorDotActive: {
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  colorDotWhiteBorder: {
    borderWidth: 1,
    borderColor: "#666",
  },
  toolRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toolGroup: {
    flexDirection: "row",
    gap: 8,
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toolButtonActive: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  toolLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  actionButton: {
    padding: 8,
  },
  clearText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
  },
  clearTextDisabled: {
    color: "#555",
  },
});
