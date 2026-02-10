import { Switch, View } from "react-native";
import React, { useCallback } from "react";
import { chatUserStatus } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { useUpdateAvailabilityStatusMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { PLATFORM } from "@/constants/platformConstants";

export default function AvailabilitySection({ status }: { status: chatUserStatus }) {
  const { setUserStatus } = useUserStore();
  const isAvailable = status === chatUserStatus.AVAILABLE;

  const { mutate } = useUpdateAvailabilityStatusMutation({}, (data: chatUserStatus) => {
    setUserStatus(data);
  });

  const toggleAvailability = useCallback(() => {
    const nextStatus = isAvailable ? chatUserStatus.BUSY : chatUserStatus.AVAILABLE;
    mutate(nextStatus);
  }, [isAvailable, mutate]);

  return (
    <View className="bg-white dark:bg-gray-800/50 rounded-xl p-5 mb-5">
      <View className="flex-row items-center justify-between">
        <View>
          <AppText className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
            Busy Mode
          </AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            When enabled, notifications will be silenced
          </AppText>
        </View>

        <Switch
          value={!isAvailable}
          onValueChange={toggleAvailability}
          trackColor={{ false: "#767577", true: "#6B4EFF" }}
          thumbColor="#f4f4f5"
          {...(PLATFORM.IS_WEB && {
            activeThumbColor: "#f4f4f5",
          })}
        />
      </View>
    </View>
  );
}
