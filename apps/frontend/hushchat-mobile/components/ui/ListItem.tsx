import React, { useCallback } from "react";
import { Pressable, View } from "react-native";
import classNames from "classnames";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";

interface ListItemProps {
  leading?: React.ReactNode;
  title: string;
  titleClassName?: string;
  subtitle?: string | React.ReactNode;
  subtitleClassName?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  className?: string;
}

const PRESS_SCALE = 0.98;
const PRESS_DURATION = 100;
const RELEASE_DURATION = 150;

export const ListItem = ({
  leading,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  trailing,
  onPress,
  disabled = false,
  selected = false,
  className: extraClassName,
}: ListItemProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!PLATFORM.IS_WEB) {
      scale.value = withTiming(PRESS_SCALE, { duration: PRESS_DURATION });
    }
  }, [scale]);

  const handlePressOut = useCallback(() => {
    if (!PLATFORM.IS_WEB) {
      scale.value = withTiming(1, { duration: RELEASE_DURATION });
    }
  }, [scale]);

  return (
    <Animated.View style={!PLATFORM.IS_WEB ? animatedStyle : undefined}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={classNames(
          "flex-row items-center px-4 py-3 gap-3",
          "active:bg-secondary-light dark:active:bg-secondary-dark",
          PLATFORM.IS_WEB && "hover:bg-secondary-light dark:hover:bg-secondary-dark",
          selected && "bg-secondary-light dark:bg-secondary-dark",
          extraClassName
        )}
      >
        {leading && <View>{leading}</View>}

        <View className="flex-1 min-w-0">
          <AppText
            className={classNames(
              "text-base font-medium text-text-primary-light dark:text-text-primary-dark",
              titleClassName
            )}
            numberOfLines={1}
          >
            {title}
          </AppText>
          {subtitle &&
            (typeof subtitle === "string" ? (
              <AppText
                className={classNames(
                  "text-sm text-text-secondary-light dark:text-text-secondary-dark",
                  subtitleClassName
                )}
                numberOfLines={1}
              >
                {subtitle}
              </AppText>
            ) : (
              subtitle
            ))}
        </View>

        {trailing && <View className="flex-row items-center">{trailing}</View>}
      </Pressable>
    </Animated.View>
  );
};
