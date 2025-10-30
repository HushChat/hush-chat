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

/**
 * MobileCallInterface
 *
 * Mobile (iOS/Android) container for the Calls screen.
 */

import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FilterButton from "@/components/FilterButton";
import { CallLogComponentProps } from "@/types/call/types";

const CallInterface = ({ callItemList, filters }: CallLogComponentProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            Calls
          </Text>
        </View>
      </View>

      <View className="bg-background-light dark:bg-background-dark px-4 py-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-x-2">
            {filters.map((filter, index) => (
              <FilterButton
                key={index}
                label={filter.title}
                isActive={filter.isActive}
              />
            ))}
          </View>
        </ScrollView>
      </View>
      {callItemList}
    </View>
  );
};

export default CallInterface;
