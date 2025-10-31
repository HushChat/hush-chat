import React, { useCallback, useEffect, useState } from "react";
import { Modal, View, Text, Pressable, Dimensions, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { TImagePreviewProps } from "@/types/chat/types";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import { usePanGesture } from "@/gestures/base/usePanGesture";
import { useDoubleTapGesture } from "@/gestures/base/useDoubleTapGesture";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const ImagePreview = ({ visible, images, initialIndex, onClose }: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
          <View className="flex-1 bg-white dark:bg-black">
            <View className="absolute left-0 right-0 flex-row justify-between items-center px-5 py-4 z-10 bg-white dark:bg-black backdrop-blur-sm">
              <Text className="text-gray-900 dark:text-white text-base font-semibold">
                {currentIndex + 1} / {images.length}
              </Text>
              <Pressable onPress={onClose} className="p-2 active:opacity-60">
                <Ionicons name="close" size={28} color="#6B7280" />
              </Pressable>
            </View>

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

            {images.length > 1 && (
              <View className="absolute bottom-0 left-0 right-0 p-5 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-[#202C33]">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
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
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
};
