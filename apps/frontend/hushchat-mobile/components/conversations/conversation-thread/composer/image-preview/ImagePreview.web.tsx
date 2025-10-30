import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { TImagePreviewProps } from "@/types/chat/types";

export const ImagePreview = ({
  visible,
  images,
  initialIndex,
  onClose,
}: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (thumbnailScrollRef.current && images.length > 1) {
      const thumbnailWidth = 80;
      const gap = 8;
      const offset =
        currentIndex * (thumbnailWidth + gap) - (thumbnailWidth + gap);
      thumbnailScrollRef.current.scrollTo({ x: offset, animated: true });
    }
  }, [currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!visible) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    },
    [visible, onClose, handlePrevious, handleNext],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown]);

  if (!visible) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="bg-background-light dark:bg-background-dark px-6 py-4 flex-row justify-between items-center">
          <View className="flex-1">
            <Text
              className="text-gray-900 dark:text-white text-base font-normal"
              numberOfLines={1}
            >
              {currentImage?.originalFileName || "Image"}
            </Text>
            <Text className="text-gray-500 dark:text-[#8696A0] text-sm mt-0.5">
              {currentIndex + 1} of {images.length}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="p-2 active:opacity-60 cursor-pointer ml-4"
          >
            <Ionicons name="close" size={24} color="#8696A0" />
          </Pressable>
        </View>

        <View className="flex-1 flex-row bg-background-light dark:bg-background-dark">
          {images.length > 1 && currentIndex > 0 && (
            <View className="justify-center items-center w-20">
              <Pressable
                onPress={handlePrevious}
                className="bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-[#2A3942] p-3 rounded-full active:opacity-80 cursor-pointer"
              >
                <Ionicons name="chevron-back" size={24} color="#6B7280" />
              </Pressable>
            </View>
          )}

          <View className="flex-1 justify-center items-center p-4">
            <Image
              source={{ uri: currentImage?.fileUrl }}
              className="w-full h-full"
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>

          {images.length > 1 && currentIndex < images.length - 1 && (
            <View className="justify-center items-center w-20">
              <Pressable
                onPress={handleNext}
                className="bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-[#2A3942] p-3 rounded-full active:opacity-80 cursor-pointer"
              >
                <Ionicons name="chevron-forward" size={24} color="#6B7280" />
              </Pressable>
            </View>
          )}
        </View>

        {images.length > 1 && (
          <View className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-[#202C33] py-4">
            <View className="items-center justify-center">
              <ScrollView
                ref={thumbnailScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 8,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: images.length <= 6 ? "center" : "flex-start",
                }}
                style={{ maxWidth: "100%" }}
              >
                {images.map((image, index) => (
                  <Pressable
                    key={image.id || index}
                    onPress={() => setCurrentIndex(index)}
                    className="active:opacity-70 cursor-pointer"
                  >
                    <View
                      className={`rounded-lg overflow-hidden ${
                        currentIndex === index
                          ? "border-4 border-primary-light dark:border-primary-dark"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        source={{ uri: image.fileUrl }}
                        className="w-20 h-20"
                        contentFit="cover"
                      />
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};
