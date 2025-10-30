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
