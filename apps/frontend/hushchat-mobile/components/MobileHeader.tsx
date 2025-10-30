/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackButton from "./BackButton";

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

export default function MobileHeader({
  title,
  onBack,
  rightAction,
}: MobileHeaderProps) {
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
          <Text className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </Text>
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
              <Text
                className={`font-medium ${
                  rightAction.disabled
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-white"
                }`}
              >
                {rightAction.label}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
