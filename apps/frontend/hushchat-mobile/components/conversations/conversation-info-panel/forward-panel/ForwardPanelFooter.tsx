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

import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

interface ForwardPanelFooterProps {
  isPending: boolean;
  canSend: boolean;
  selectedCount: number;
  onCancel: () => void;
  onSend: () => void;
}

export const ForwardPanelFooter = ({
  isPending,
  canSend,
  selectedCount,
  onCancel,
  onSend,
}: ForwardPanelFooterProps) => {
  return (
    <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={onCancel}
        className="px-4 py-2 rounded-lg bg-secondary-light dark:bg-secondary-dark"
        disabled={isPending}
      >
        <Text className="text-gray-800 dark:text-gray-200">Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSend}
        disabled={!canSend}
        className={`px-4 py-2 rounded-lg ${
          canSend
            ? "bg-primary-light dark:bg-primary-dark"
            : "bg-gray-300 dark:bg-gray-700"
        } flex-row items-center`}
      >
        {isPending && (
          <ActivityIndicator size="small" color="#fff" className="mr-2" />
        )}
        <Text className="text-white">
          {isPending ? "Sending…" : `Send to ${selectedCount || ""}`}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
