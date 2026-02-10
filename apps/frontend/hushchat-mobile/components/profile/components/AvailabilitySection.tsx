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
    <View className="flex-row items-center justify-between">
      <View>
        <AppText className="text-lg font-semibold">BUSY</AppText>
      </View>

      <Switch
        value={!isAvailable}
        onValueChange={toggleAvailability}
        trackColor={{ false: "#767577", true: "#6B4EFF" }}
        thumbColor="#000000"
        {...(PLATFORM.IS_WEB && {
          activeThumbColor: "#000000",
        })}
      />
    </View>
  );
}
