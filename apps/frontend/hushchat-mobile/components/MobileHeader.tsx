import { View, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "./BackButton";
import { AppText } from "@/components/AppText";

type RightAction = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

type MobileHeaderProps = {
  title: string;
  onBack: () => void;
  rightAction?: RightAction;
};

export default function MobileHeader({ title, onBack, rightAction }: MobileHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingTop: insets.top + 12 }}
      className="bg-white dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center justify-between">
        {/* Left side */}
        <View className="flex-row items-center">
          <BackButton onPress={onBack} />
          <AppText className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </AppText>
        </View>

        {/* Right side (optional) */}
        {rightAction && (
          <View className="flex-row gap-x-2">
            <TouchableOpacity
              onPress={rightAction.onPress}
              disabled={rightAction.disabled}
              className={`px-4 py-2 rounded-lg ${
                rightAction.disabled
                  ? "bg-gray-300 dark:bg-gray-600"
                  : "bg-primary-light dark:bg-primary-dark"
              }`}
            >
              <AppText
                className={`font-medium ${
                  rightAction.disabled ? "text-gray-500 dark:text-gray-400" : "text-white"
                }`}
              >
                {rightAction.label}
              </AppText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
