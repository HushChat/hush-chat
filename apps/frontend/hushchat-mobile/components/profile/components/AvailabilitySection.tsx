import { Switch, View } from "react-native";
import React, { useCallback } from "react";
import { chatUserStatus } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { useUpdateAvailabilityStatusMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { PLATFORM } from "@/constants/platformConstants";

export default function AvailabilitySection({ status }: { status?: chatUserStatus }) {
  const { fetchUserData } = useUserStore();
  const isAvailable = status === chatUserStatus.AVAILABLE;

  const { mutate } = useUpdateAvailabilityStatusMutation({}, () => {
    fetchUserData();
  });

  const toggleAvailability = useCallback(() => {
    mutate(undefined);
  }, [mutate]);

  return (
    <View className="flex-row items-center justify-between">
      <View>
        <AppText className="text-base font-semibold">Availability</AppText>
        <AppText className="text-sm">
          Appearing as{" "}
          <AppText className={isAvailable ? "text-green-600" : "text-red-500"}>
            {isAvailable ? "Available" : "Busy"}
          </AppText>
        </AppText>
      </View>

      <Switch
        value={isAvailable}
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
