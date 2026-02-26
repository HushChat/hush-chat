import React, { useCallback, useRef, useState } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { DrawPath } from "./types";
import { TOOL_CONFIG } from "./constants";

type DrawingCanvasProps = {
  paths: DrawPath[];
  activeTool: "pen" | "highlighter";
  activeColor: string;
  onStartPath: (x: number, y: number) => void;
  onAddPoint: (x: number, y: number) => void;
  onEndPath: () => void;
  currentPathRef: React.MutableRefObject<string[]>;
};

const DrawingCanvas = ({
  paths,
  activeTool,
  activeColor,
  onStartPath,
  onAddPoint,
  onEndPath,
  currentPathRef,
}: DrawingCanvasProps) => {
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [livePathData, setLivePathData] = useState<string>("");
  const isDrawingRef = useRef(false);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  const config = TOOL_CONFIG[activeTool];

  const panGesture = Gesture.Pan()
    .minDistance(0)
    .onStart((e) => {
      isDrawingRef.current = true;
      onStartPath(e.x, e.y);
      setLivePathData(`M${e.x},${e.y}`);
    })
    .onUpdate((e) => {
      if (!isDrawingRef.current) return;
      onAddPoint(e.x, e.y);
      setLivePathData(currentPathRef.current.join(" "));
    })
    .onEnd(() => {
      isDrawingRef.current = false;
      onEndPath();
      setLivePathData("");
    })
    .onFinalize(() => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        onEndPath();
        setLivePathData("");
      }
    });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <GestureDetector gesture={panGesture}>
        <View style={StyleSheet.absoluteFill}>
          {canvasSize.width > 0 && (
            <Svg
              width={canvasSize.width}
              height={canvasSize.height}
              style={StyleSheet.absoluteFill}
            >
              {paths.map((path) => (
                <Path
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
                <Path
                  d={livePathData}
                  stroke={activeColor}
                  strokeWidth={config.strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={config.opacity}
                />
              )}
            </Svg>
          )}
        </View>
      </GestureDetector>
    </View>
  );
};

export default DrawingCanvas;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
