import { ToastConfigParams } from 'react-native-toast-message';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useToastAnimation, TOAST_POSITION, ToastPosition } from '@/hooks/useToastAnimation';

const TOAST_ICONS = {
  success: { name: 'checkmark-circle' as const, color: '#22c55e' },
  error: { name: 'close-circle' as const, color: '#ef4444' },
  info: { name: 'information-circle' as const, color: '#3b82f6' },
  warn: { name: 'warning' as const, color: '#f59e0b' },
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

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        className={`rounded-full py-3 px-4 flex-row items-center justify-between self-center max-w-[90%] sm:max-w-[400px] shadow-md ${
          isDark ? 'bg-background-light' : 'bg-background-dark'
        }`}
        style={animatedStyle}
      >
        <View className="flex-row items-center">
          <Ionicons name={name} size={26} color={color} style={{ marginRight: 12 }} />
          <View style={{ flexShrink: 1 }}>
            <Text
              className={`font-semibold text-base ${
                isDark ? 'text-text-primary-light' : 'text-text-primary-dark'
              }`}
            >
              {title}
            </Text>
            {message && (
              <Text
                className={`text-sm mt-1 ${
                  isDark ? 'text-text-secondary-light' : 'text-text-secondary-dark'
                }`}
              >
                {message}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

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
