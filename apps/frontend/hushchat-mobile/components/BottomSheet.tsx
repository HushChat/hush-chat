import React, { useEffect } from "react";
import { View, Modal, TouchableOpacity, TouchableWithoutFeedback, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";

export interface BottomSheetOption {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  options: BottomSheetOption[];
  title?: string;
  showBorders?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BottomSheet = ({
  visible,
  onClose,
  options,
  title,
  showBorders = true,
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: 250,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 250,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, translateY, opacity]);

  const handleClose = () => {
    scheduleOnRN(onClose);
  };

  const handleOptionPress = (option: BottomSheetOption) => {
    option.onPress();
    handleClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View
          style={[
            {
              flex: 1,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            backdropStyle,
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                sheetStyle,
              ]}
              className="bg-background-light dark:bg-background-dark rounded-t-3xl"
            >
              <View className="items-center py-3">
                <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </View>

              {title && (
                <View className="px-4 pb-2">
                  <AppText className="text-lg font-semibold text-center text-text-primary-light dark:text-text-primary-dark">
                    {title}
                  </AppText>
                </View>
              )}

              <View className="px-4 pb-4" style={{ paddingBottom: insets.bottom + 16 }}>
                {options.map((option, index) => (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={DEFAULT_ACTIVE_OPACITY}
                    className={`flex-row items-center py-4 px-2 ${
                      showBorders && index < options.length - 1
                        ? "border-b border-gray-200 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                        option.destructive
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-gray-100 dark:bg-gray-800"
                      }`}
                    >
                      <Ionicons
                        name={option.icon}
                        size={20}
                        color={option.destructive ? "#EF4444" : "#6B7280"}
                      />
                    </View>
                    <AppText
                      className={`text-base font-medium ${
                        option.destructive
                          ? "text-red-500"
                          : "text-text-primary-light dark:text-text-primary-dark"
                      }`}
                    >
                      {option.title}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheet;
