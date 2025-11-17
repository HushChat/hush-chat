import React from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { scheduleOnRN } from "react-native-worklets";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";

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

const COLORS = {
  BACKDROP: "rgba(0, 0, 0, 0.5)",
  ICON_DESTRUCTIVE: "#EF4444",
  ICON_NEUTRAL: "#6B7280",
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BottomSheet = ({
  visible,
  onClose,
  options,
  title,
  showBorders = true,
}: BottomSheetProps) => {
  const insets = useSafeAreaInsets();

  const handleClose = () => scheduleOnRN(onClose);

  const handleOptionPress = (option: BottomSheetOption) => {
    option.onPress();
    handleClose();
  };

  const optionsContainerStyle = {
    paddingBottom: insets.bottom + 16,
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.fullscreen}>
          <MotionView
            visible={visible}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            duration={{ enter: 300, exit: 250 }}
            easing="standard"
            style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            pointerEvents="none"
          />

          {/* SHEET */}
          <MotionView
            visible={visible}
            from={{ translateY: SCREEN_HEIGHT }}
            to={{ translateY: 0 }}
            duration={{ enter: 300, exit: 250 }}
            easing="standard"
            pointerEvents="box-none"
            style={styles.sheetContainer}
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

            <View className="px-4 pb-4" style={optionsContainerStyle}>
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
                      color={option.destructive ? COLORS.ICON_DESTRUCTIVE : COLORS.ICON_NEUTRAL}
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
          </MotionView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: COLORS.BACKDROP,
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
