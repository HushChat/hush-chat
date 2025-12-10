import React, { useEffect, useState } from "react";
import { View, ImageSourcePropType } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { MotionView } from "@/motion/MotionView";
import { AppText } from "@/components/AppText";
import { MotionConfig } from "@/motion/config";

type PlaceholderProps = {
  title: string;
  subtitle?: string;
  image: ImageSourcePropType;
  bottomNote?: string;
  imageWidth?: number;
  imageHeight?: number;
  showDelayMs?: number;
  imageFadeMs?: number;
  slideFromY?: number;
  showBackground?: boolean;
};

const DEFAULT_IMAGE_WIDTH = 300;
const DEFAULT_IMAGE_HEIGHT = 300;
const DEFAULT_SHOW_DELAY_MS = 50;
const DEFAULT_IMAGE_FADE_MS = 500;
const DEFAULT_SLIDE_FROM_Y = 20;

export default function Placeholder({
  title,
  subtitle,
  image,
  bottomNote = "Private and secure workspace communication.",
  imageWidth = DEFAULT_IMAGE_WIDTH,
  imageHeight = DEFAULT_IMAGE_HEIGHT,
  showDelayMs = DEFAULT_SHOW_DELAY_MS,
  imageFadeMs = DEFAULT_IMAGE_FADE_MS,
  slideFromY = DEFAULT_SLIDE_FROM_Y,
  showBackground = true,
}: PlaceholderProps) {
  const [visible, setVisible] = useState(false);

  const imgOpacity = useSharedValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), showDelayMs);
    return () => clearTimeout(timeout);
  }, [showDelayMs]);

  const handleImageLoad = () => {
    imgOpacity.value = withTiming(1, { duration: imageFadeMs });
  };

  const imageStyle = useAnimatedStyle(() => ({
    width: imageWidth,
    height: imageHeight,
    opacity: imgOpacity.value,
  }));

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
      <MotionView
        visible={visible}
        from={{ opacity: 0, translateY: slideFromY }}
        to={{ opacity: 1, translateY: 0 }}
        duration={MotionConfig.duration.md}
        easing="emphasized"
        className="items-center"
      >
        {showBackground && (
          <View className="absolute w-72 h-72 bg-primary-light/5 dark:bg-primary-dark/15 rounded-full" />
        )}

        <Animated.Image
          source={image}
          onLoad={handleImageLoad}
          style={imageStyle}
          resizeMode="contain"
        />

        <AppText className="text-2xl font-semibold text-center text-text-primary-light dark:text-text-primary-dark mb-2">
          {title}
        </AppText>

        {!!subtitle && (
          <AppText className="text-base text-center text-text-secondary-light dark:text-text-secondary-dark mb-12 px-8 leading-6">
            {subtitle}
          </AppText>
        )}
      </MotionView>

      {!!bottomNote && (
        <AppText className="absolute bottom-6 text-xs text-gray-400 dark:text-gray-500">
          {bottomNote}
        </AppText>
      )}
    </View>
  );
}
