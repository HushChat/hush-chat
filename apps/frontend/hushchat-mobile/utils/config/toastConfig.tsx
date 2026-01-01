import { ToastConfigParams } from "react-native-toast-message";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useToastAnimation, TOAST_POSITION, ToastPosition } from "@/hooks/useToastAnimation";
import { AppText } from "@/components/AppText";

const TOAST_ICONS = {
  success: { name: "checkmark-circle" as const, color: "#22c55e" },
  error: { name: "close-circle" as const, color: "#ef4444" },
  info: { name: "information-circle" as const, color: "#3b82f6" },
  warn: { name: "warning" as const, color: "#f59e0b" },
} as const;

type ToastType = keyof typeof TOAST_ICONS;

interface BaseToastContainerProps {
  type: ToastType;
  params: ToastConfigParams<{ position?: ToastPosition }>;
}

function BaseToastContainer({ type, params }: BaseToastContainerProps) {
  const { isDark } = useAppTheme();

  const { text1: title, text2: message, position = TOAST_POSITION.TOP, isVisible } = params;

  const { gesture, animatedStyle } = useToastAnimation(position, title, message, isVisible);

  const { name, color } = TOAST_ICONS[type];

  const primaryTextColor = isDark ? "#111827" : "#1F2937";
  const secondaryTextColor = isDark ? "#9ca3af" : "#6B7280";

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`rounded-full py-3 px-4 flex-row items-center justify-between self-center max-w-[90%] sm:max-w-[400px] shadow-md ${
          isDark ? "bg-background-light" : "bg-background-dark"
        }`}
        style={animatedStyle}
      >
        <View className="flex-row items-center">
          <Ionicons name={name} size={26} color={color} style={styles.rightMargin} />
          <View style={styles.shrink}>
            <AppText className="font-bold text-base" style={{ color: primaryTextColor }}>
              {title}
            </AppText>
            {message && (
              <AppText className="text-sm mt-1" style={{ color: secondaryTextColor }}>
                {message}
              </AppText>
            )}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  rightMargin: {
    marginRight: 12,
  },
  shrink: {
    flexShrink: 1,
  },
});

export const toastConfig: Record<
  ToastType,
  (params: ToastConfigParams<{ position?: ToastPosition }>) => JSX.Element
> = {
  success: (params) => <BaseToastContainer type="success" params={params} />,
  error: (params) => <BaseToastContainer type="error" params={params} />,
  info: (params) => <BaseToastContainer type="info" params={params} />,
  warn: (params) => <BaseToastContainer type="warn" params={params} />,
};

export default toastConfig;
