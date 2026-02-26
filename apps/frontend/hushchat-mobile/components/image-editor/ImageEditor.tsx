import React, { useCallback, useRef, useState } from "react";
import {
  Modal,
  View,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import { AppText } from "@/components/AppText";
import DrawingCanvas from "./DrawingCanvas";
import EditorToolbar from "./EditorToolbar";
import { useDrawing } from "./useDrawing";
import { ImageEditorProps } from "./types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ImageEditor = ({ visible, imageUri, onSave, onCancel }: ImageEditorProps) => {
  const insets = useSafeAreaInsets();
  const viewShotRef = useRef<ViewShot>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [imageAspect, setImageAspect] = useState(1);

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

  const handleImageLoad = useCallback(() => {
    Image.getSize(
      imageUri,
      (w, h) => {
        if (w > 0 && h > 0) setImageAspect(w / h);
      },
      () => {}
    );
  }, [imageUri]);

  const canvasWidth = SCREEN_WIDTH;
  const canvasHeight = canvasWidth / imageAspect;

  const handleSave = useCallback(async () => {
    if (!viewShotRef.current?.capture) return;

    setIsSaving(true);
    try {
      const uri = await viewShotRef.current.capture();
      onSave(uri);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleDone = useCallback(() => {
    if (hasEdits) {
      void handleSave();
    } else {
      onCancel();
    }
  }, [hasEdits, handleSave, onCancel]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.flex1} edges={["bottom"]}>
        <View style={styles.root}>
          <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={onCancel} style={styles.headerButton}>
              <AppText style={styles.cancelText}>Cancel</AppText>
            </Pressable>

            <AppText style={styles.headerTitle}>Edit Photo</AppText>

            <Pressable onPress={handleDone} disabled={isSaving} style={styles.headerButton}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <AppText style={styles.doneText}>{hasEdits ? "Done" : "Skip"}</AppText>
              )}
            </Pressable>
          </View>

          <GestureHandlerRootView style={styles.flex1}>
            <View style={styles.canvasArea}>
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1, result: "tmpfile" }}
                style={[styles.viewShot, { width: canvasWidth, height: canvasHeight }]}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoad={handleImageLoad}
                />
                <DrawingCanvas
                  paths={paths}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  onStartPath={startPath}
                  onAddPoint={addPoint}
                  onEndPath={endPath}
                  currentPathRef={currentPathRef}
                />
              </ViewShot>
            </View>
          </GestureHandlerRootView>

          <View style={[styles.toolbar, { paddingBottom: insets.bottom + 8 }]}>
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
      </SafeAreaView>
    </Modal>
  );
};

export default ImageEditor;

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: "#000",
  },
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  cancelText: {
    color: "#fff",
    fontSize: 16,
  },
  doneText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
  },
  canvasArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewShot: {
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  toolbar: {
    paddingTop: 12,
  },
});
