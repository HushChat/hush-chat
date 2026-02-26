import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, View, Pressable, StyleSheet, Dimensions } from "react-native";
import { AppText } from "@/components/AppText";
import EditorToolbar from "./EditorToolbar";
import { useDrawing } from "./useDrawing";
import { TOOL_CONFIG } from "./constants";
import { DrawPath } from "./types";

type ImageEditorWebProps = {
  visible: boolean;
  imageUri: string;
  onSave: (editedFile: File) => void;
  onCancel: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const drawPathOnContext = (ctx: CanvasRenderingContext2D, path: DrawPath) => {
  const commands = path.points.match(/[ML][^ML]*/g);
  if (!commands || commands.length < 2) return;

  ctx.beginPath();
  ctx.strokeStyle = path.color;
  ctx.lineWidth = path.strokeWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = path.opacity;

  commands.forEach((cmd) => {
    const type = cmd[0];
    const coords = cmd
      .slice(1)
      .split(",")
      .map((n) => parseFloat(n.trim()));
    if (type === "M") ctx.moveTo(coords[0], coords[1]);
    else ctx.lineTo(coords[0], coords[1]);
  });

  ctx.stroke();
  ctx.globalAlpha = 1;
};

const ImageEditorWeb = ({ visible, imageUri, onSave, onCancel }: ImageEditorWebProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<View>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const {
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
  } = useDrawing();

  const [livePathData, setLivePathData] = useState("");
  const config = TOOL_CONFIG[activeTool];

  useEffect(() => {
    if (!visible || !imageUri) return;

    const img = new window.Image();
    img.onload = () => {
      const maxW = SCREEN_WIDTH * 0.6;
      const maxH = SCREEN_HEIGHT * 0.65;
      const scale = Math.min(maxW / img.width, maxH / img.height, 1);
      setCanvasSize({
        width: Math.round(img.width * scale),
        height: Math.round(img.height * scale),
      });
    };
    img.src = imageUri;
  }, [visible, imageUri]);

  const getRelativeCoords = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const { x, y } = getRelativeCoords(e);
      setIsDrawing(true);
      startPath(x, y);
      setLivePathData(`M${x},${y}`);
    },
    [getRelativeCoords, startPath]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDrawing) return;
      const { x, y } = getRelativeCoords(e);
      addPoint(x, y);
      setLivePathData(currentPathRef.current.join(" "));
    },
    [isDrawing, getRelativeCoords, addPoint, currentPathRef]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    endPath();
    setLivePathData("");
  }, [isDrawing, endPath]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUri;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      const scaleX = img.width / canvasSize.width;
      const scaleY = img.height / canvasSize.height;

      ctx.save();
      ctx.scale(scaleX, scaleY);
      paths.forEach((path) => drawPathOnContext(ctx, path));
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png", 1)
      );

      if (blob) {
        const file = new File([blob], "edited-image.png", { type: "image/png" });
        onSave(file);
      }
    } finally {
      setIsSaving(false);
    }
  }, [imageUri, canvasSize, paths, onSave]);

  const handleDone = useCallback(() => {
    if (hasEdits) {
      void handleSave();
    } else {
      onCancel();
    }
  }, [hasEdits, handleSave, onCancel]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.root}>
          <View style={styles.header}>
            <Pressable onPress={onCancel} style={styles.headerButton}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </Pressable>

            <AppText style={styles.headerTitle}>Edit Photo</AppText>

            <Pressable onPress={handleDone} disabled={isSaving} style={styles.headerButton}>
              <AppText style={[styles.doneText, isSaving && styles.doneTextDisabled]}>
                {hasEdits ? "Done" : "Skip"}
              </AppText>
            </Pressable>
          </View>

          <View style={styles.canvasArea} ref={containerRef}>
            <View
              style={[styles.canvasWrapper, { width: canvasSize.width, height: canvasSize.height }]}
            >
              <img
                ref={imgRef}
                src={imageUri}
                style={{
                  width: canvasSize.width,
                  height: canvasSize.height,
                  objectFit: "contain",
                  display: "block",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                draggable={false}
                alt="Edit preview"
              />
              <svg
                ref={svgRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  cursor: "crosshair",
                }}
                onMouseDown={handleMouseDown as any}
                onMouseMove={handleMouseMove as any}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {paths.map((path) => (
                  <path
                    key={path.id}
                    d={path.points}
                    stroke={path.color}
                    strokeWidth={path.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={path.opacity}
                  />
                ))}
                {livePathData.length > 0 && (
                  <path
                    d={livePathData}
                    stroke={activeColor}
                    strokeWidth={config.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity={config.opacity}
                  />
                )}
              </svg>
            </View>
          </View>

          <View style={styles.toolbar}>
            <EditorToolbar
              activeTool={activeTool}
              activeColor={activeColor}
              hasEdits={hasEdits}
              onToolChange={setActiveTool}
              onColorChange={setActiveColor}
              onUndo={undo}
              onClearAll={clearAll}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageEditorWeb;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  root: {
    width: "90%",
    maxWidth: 900,
    maxHeight: "90%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelText: {
    color: "#fff",
    fontSize: 15,
  },
  doneText: {
    color: "#007AFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "right",
  },
  doneTextDisabled: {
    opacity: 0.5,
  },
  canvasArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  canvasWrapper: {
    position: "relative",
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 12,
    paddingBottom: 16,
  },
});
