import React, { useCallback, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet, LayoutChangeEvent } from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import Svg, { Path, Image as SvgImage } from "react-native-svg";
import { DrawPath } from "./types";
import { TOOL_CONFIG } from "./constants";

type DrawingCanvasProps = {
  imageUri: string;
  paths: DrawPath[];
  activeTool: "pen" | "highlighter";
  activeColor: string;
  onStartPath: (x: number, y: number) => void;
  onAddPoint: (x: number, y: number) => void;
  onEndPath: () => void;
  currentPathRef: React.MutableRefObject<string[]>;
};

export type DrawingCanvasHandle = {
  toDataURL: (callback: (base64: string) => void) => void;
};

const THROTTLE_MS = 32;

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  (
    {
      imageUri,
      paths,
      activeTool,
      activeColor,
      onStartPath,
      onAddPoint,
      onEndPath,
      currentPathRef,
    },
    ref
  ) => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [livePathData, setLivePathData] = useState("");
    const isDrawingRef = useRef(false);
    const lastRenderTimeRef = useRef(0);
    const pendingRafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
    const svgRef = useRef<Svg>(null);

    useImperativeHandle(ref, () => ({
      toDataURL: (callback: (base64: string) => void) => {
        if (svgRef.current) {
          (svgRef.current as any).toDataURL(callback);
        }
      },
    }));

    const handleLayout = useCallback((e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      setCanvasSize({ width, height });
    }, []);

    const config = TOOL_CONFIG[activeTool];

    const handleStart = useCallback(
      (x: number, y: number) => {
        isDrawingRef.current = true;
        onStartPath(x, y);
        lastRenderTimeRef.current = Date.now();
        setLivePathData(`M${x},${y}`);
      },
      [onStartPath]
    );

    const handleUpdate = useCallback(
      (x: number, y: number) => {
        if (!isDrawingRef.current) return;
        onAddPoint(x, y);

        if (pendingRafRef.current !== null) return;

        const now = Date.now();
        if (now - lastRenderTimeRef.current >= THROTTLE_MS) {
          lastRenderTimeRef.current = now;
          setLivePathData(currentPathRef.current.join(" "));
        } else {
          pendingRafRef.current = requestAnimationFrame(() => {
            pendingRafRef.current = null;
            lastRenderTimeRef.current = Date.now();
            setLivePathData(currentPathRef.current.join(" "));
          });
        }
      },
      [onAddPoint, currentPathRef]
    );

    const handleEnd = useCallback(() => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      if (pendingRafRef.current !== null) {
        cancelAnimationFrame(pendingRafRef.current);
        pendingRafRef.current = null;
      }
      onEndPath();
      setLivePathData("");
    }, [onEndPath]);

    const panGesture = Gesture.Pan()
      .minDistance(0)
      .onStart((e) => {
        runOnJS(handleStart)(e.x, e.y);
      })
      .onUpdate((e) => {
        runOnJS(handleUpdate)(e.x, e.y);
      })
      .onEnd(() => {
        runOnJS(handleEnd)();
      })
      .onFinalize(() => {
        runOnJS(handleEnd)();
      });

    return (
      <View style={styles.container} onLayout={handleLayout}>
        <GestureDetector gesture={panGesture}>
          <View style={StyleSheet.absoluteFill}>
            {canvasSize.width > 0 && (
              <Svg
                ref={svgRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={StyleSheet.absoluteFill}
              >
                <SvgImage
                  href={imageUri}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  preserveAspectRatio="xMidYMid meet"
                />

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
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
