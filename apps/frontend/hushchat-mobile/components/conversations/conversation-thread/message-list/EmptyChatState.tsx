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
import { View, Text } from "react-native";

const EmptyChatState = () => {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-4xl mb-4">💬</Text>
      <Text className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
        No messages yet
      </Text>
      <Text className="text-gray-600 dark:text-text-secondary-dark text-center">
        Start the conversation by sending a message
      </Text>
    </View>
  );
};

export default EmptyChatState;
