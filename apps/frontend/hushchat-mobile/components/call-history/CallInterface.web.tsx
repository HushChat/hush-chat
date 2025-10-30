/**
 * WebCallInterface
 *
 * Web container for the Calls screen.
 */

import { CallLogComponentProps } from "@/types/call/types";
import React from "react";
import { View } from "react-native";
import FilterButton from "@/components/FilterButton";
import RefreshButton from "@/components/RefreshButton";
import Placeholder from "@/components/Placeholder";
import { Images } from "@/assets/images";
import { AppText } from "@/components/AppText";

function CallComponentPlaceHolder() {
  return (
    <Placeholder
      title="Start a call"
      subtitle="Select a call from the list or place a new one."
      image={Images.CallLogPlaceholder}
    />
  );
}

const CallInterface = ({
  callItemList,
  filters,
  isCallLogsLoading,
  refetchCallLogs,
}: CallLogComponentProps) => {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row h-full">
        <View className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-secondary-light dark:border-secondary-dark">
          <View className="px-6 py-4 flex-row items-center justify-between">
            <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Calls
            </AppText>
            <RefreshButton
              onRefresh={refetchCallLogs}
              isLoading={isCallLogsLoading}
            />
          </View>

          <View className="px-6 py-3">
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row space-x-2">
                {filters.map((filter, index) => (
                  <FilterButton
                    key={index}
                    label={filter.title}
                    isActive={filter.isActive}
                  />
                ))}
              </View>
            </View>
          </View>

          <View>
            <View className="max-w-md mx-auto w-full">{callItemList}</View>
          </View>
        </View>

        <View className="flex-1 bg-background-light dark:bg-background-dark">
          <CallComponentPlaceHolder />
        </View>
      </View>
    </View>
  );
};

export default CallInterface;
