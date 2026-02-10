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
  const isBusy = !isAvailable;

  const { mutate } = useUpdateAvailabilityStatusMutation({}, (data: chatUserStatus) => {
    setUserStatus(data);
  });

  const toggleAvailability = useCallback(() => {
    const nextStatus = isAvailable ? chatUserStatus.BUSY : chatUserStatus.AVAILABLE;
    mutate(nextStatus);
  }, [isAvailable, mutate]);

  return (
    <View className="mb-4">
      <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        Status
      </AppText>
      <View className="flex-row items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
        <AppText className={`text-base font-medium ${isBusy ? "text-red-500" : "text-green-500"}`}>
          {isBusy ? "Busy" : "Available"}
        </AppText>

        <Switch
          value={isBusy}
          onValueChange={toggleAvailability}
          trackColor={{ false: "#d1d5db", true: "#6B4EFF" }}
          thumbColor="#ffffff"
          {...(PLATFORM.IS_WEB && {
            activeThumbColor: "#ffffff",
          })}
        />
      </View>
    </View>
  );
}
