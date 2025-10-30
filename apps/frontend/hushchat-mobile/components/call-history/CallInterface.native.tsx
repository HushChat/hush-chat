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
