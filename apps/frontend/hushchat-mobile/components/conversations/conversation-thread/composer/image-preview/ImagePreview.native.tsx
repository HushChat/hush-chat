import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Dimensions,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Directory, Paths } from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { TImagePreviewProps } from "@/types/chat/types";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import { usePanGesture } from "@/gestures/base/usePanGesture";
import { useDoubleTapGesture } from "@/gestures/base/useDoubleTapGesture";
import { ToastUtils } from "@/utils/toastUtils";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ImagePreview = ({ visible, images, initialIndex, onClose }: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [existingFileUri, setExistingFileUri] = useState<string | null>(null);

  const isZoomed = useSharedValue(false);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const resetTransform = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    isZoomed.value = false;
  }, [scale, translateX, translateY, savedScale, isZoomed]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    resetTransform();
  }, [initialIndex, visible, resetTransform]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTransform();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetTransform();
    }
  };

  const saveToGallery = async (uri: string) => {
    try {
      await MediaLibrary.saveToLibraryAsync(uri);
      ToastUtils.success("Saved to Gallery");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Download failed. Please try again.";

      ToastUtils.error(errorMessage);
    } finally {
      setIsDownloading(false);
      setShowConfirmDialog(false);
      setExistingFileUri(null);
    }
  };

  const downloadImage = async () => {
    const currentImage = images[currentIndex];
    if (!currentImage?.fileUrl) return;

    setIsDownloading(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        ToastUtils.error("Permission Required", "Please allow access to your photos.");
        setIsDownloading(false);
        return;
      }

      const cacheDir = new Directory(Paths.cache, "downloads");
      if (!cacheDir.exists) {
        cacheDir.create();
      }

      const destinationFile = new File(cacheDir, currentImage.originalFileName);

      if (destinationFile.exists) {
        setIsDownloading(false);

        setExistingFileUri(destinationFile.uri);
        setShowConfirmDialog(true);
        return;
      }

      await File.downloadFileAsync(currentImage.fileUrl, destinationFile);
      await saveToGallery(destinationFile.uri);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Download failed.";
      ToastUtils.error(errorMessage);
      setIsDownloading(false);
    }
  };

  const { gesture: swipeGesture } = useSwipeGesture({
    enabled: images.length > 1 && !isZoomed.value,
    direction: "horizontal",
    trigger: 80,
    maxDrag: 100,
    onSwipeRight: () => {
      if (currentIndex > 0) handlePrevious();
    },
    onSwipeLeft: () => {
      if (currentIndex < images.length - 1) handleNext();
    },
    allowLeft: currentIndex < images.length - 1,
    allowRight: currentIndex > 0,
  });

  // Create pinch gesture directly instead of using the hook
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      // Clamp scale between 1 and 4
      scale.value = Math.min(Math.max(newScale, 1), 4);
      isZoomed.value = scale.value > 1.1;

      // Store focal point for proper zoom centering
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        isZoomed.value = false;
      } else {
        savedScale.value = scale.value;
      }
    });

  const { gesture: panGesture } = usePanGesture({
    enabled: true,
    axis: "free",
    onUpdate: ({ translationX: tx, translationY: ty }) => {
      if (scale.value > 1) {
        translateX.value = tx;
        translateY.value = ty;
      }
    },
    onEnd: () => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const { gesture: doubleTapGesture } = useDoubleTapGesture({
    enabled: true,
    onEnd: () => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        isZoomed.value = false;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
        isZoomed.value = true;
      }
    },
  });

  const panZoom = Gesture.Simultaneous(pinchGesture, panGesture);
  const composedGesture = Gesture.Exclusive(swipeGesture, Gesture.Race(doubleTapGesture, panZoom));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.flex1} edges={["top", "bottom"]}>
        <View className="flex-1 bg-white dark:bg-black">
          <View className="absolute left-0 right-0 flex-row justify-between items-center px-5 py-4 z-10 bg-white dark:bg-black backdrop-blur-sm">
            <Text className="text-gray-900 dark:text-white text-base font-semibold">
              {currentIndex + 1} / {images.length}
            </Text>
            <View className="flex-row items-center gap-4">
              <Pressable
                onPress={downloadImage}
                disabled={isDownloading}
                className="p-2 active:opacity-60"
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#6B7280" />
                ) : (
                  <Ionicons name="download-outline" size={26} color="#6B7280" />
                )}
              </Pressable>
              <Pressable onPress={onClose} className="p-2 active:opacity-60">
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          <GestureHandlerRootView style={styles.flex1}>
            <View className="flex-1 justify-center items-center">
              <GestureDetector gesture={composedGesture}>
                <Animated.View
                  style={[{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }, animatedStyle]}
                >
                  <Image
                    source={{ uri: currentImage?.fileUrl }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </Animated.View>
              </GestureDetector>
            </View>
          </GestureHandlerRootView>

          {images.length > 1 && (
            <View className="absolute bottom-0 left-0 right-0 p-5 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-[#202C33]">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbListContainer}
              >
                {images.map((img, idx) => (
                  <Pressable
                    key={img.id || idx}
                    onPress={() => {
                      setCurrentIndex(idx);
                      resetTransform();
                    }}
                    className="active:opacity-70"
                  >
                    <Image
                      source={{ uri: img.fileUrl }}
                      className={`w-[60px] h-[60px] rounded-lg border-2 ${
                        currentIndex === idx
                          ? "border-4 border-primary-light dark:border-primary-dark"
                          : "border-transparent"
                      }`}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <Modal
            visible={showConfirmDialog}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              setShowConfirmDialog(false);
              setExistingFileUri(null);
            }}
          >
            <View style={styles.modalOverlay}>
              <View className="w-[85%] bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 shadow-xl">
                <Text
                  style={styles.textPoppins}
                  className="text-lg font-semibold text-gray-900 dark:text-white mb-2"
                >
                  File Already Saved
                </Text>
                <Text
                  style={styles.textPoppins}
                  className="text-base text-gray-600 dark:text-gray-300 mb-6 leading-5"
                >
                  Do you want to save it to your gallery again?
                </Text>
                <View className="flex-row justify-end gap-3">
                  <Pressable
                    onPress={() => {
                      setShowConfirmDialog(false);
                      setExistingFileUri(null);
                    }}
                    className="px-4 py-2.5 rounded-lg active:bg-gray-100 dark:active:bg-gray-800"
                  >
                    <Text
                      style={styles.textPoppins}
                      className="text-base font-medium text-gray-600 dark:text-gray-400"
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      if (existingFileUri) saveToGallery(existingFileUri);
                    }}
                    className="px-4 py-2.5 bg-primary-light dark:bg-primary-dark rounded-lg active:opacity-90"
                  >
                    <Text style={styles.textPoppins} className="text-base font-bold text-white">
                      Save Again
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  thumbListContainer: {
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  textPoppins: {
    fontFamily: "Poppins-Regular",
  },
});
