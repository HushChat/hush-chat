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

import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { UserMultiSelectList } from "@/components/UserMultiSelect";
import React, { useEffect, useState } from "react";
import { TUser } from "@/types/user/types";
import { useCreateAddParticipantsMutation } from "@/query/post/queries";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";

interface AddParticipantsProps {
  conversationId: number;
  onClose: () => void;
  visible: boolean;
}

export default function AddMoreGroupParticipants({
  conversationId,
  onClose,
  visible,
}: AddParticipantsProps) {
  const screenWidth = Dimensions.get("window").width;
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);

  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);

  const { mutate: addParticipants } = useCreateAddParticipantsMutation(
    { conversationId: conversationId, keyword: "" },
    () => {
      onClose();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const saveAddParticipants = async () => {
    if (!selectedUsers || selectedUsers.length === 0) {
      return;
    }

    const newParticipantIds = selectedUsers.map((p) => p.id);
    addParticipants({ conversationId, newParticipantIds });
  };

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withDelay(
        40,
        withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) }),
      );
    } else {
      translateX.value = withTiming(screenWidth, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, screenWidth, translateX, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        containerStyle,
      ]}
      className="dark:bg-gray-900"
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-gray-900 dark:text-white">
            {"Add Participants"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={saveAddParticipants}
          disabled={selectedUsers.length === 0}
          className={`px-3 py-2 rounded-lg ${
            selectedUsers.length > 0
              ? "bg-primary-light dark:bg-primary-dark"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <Text
            className={`text-xs font-medium leading-none ${
              selectedUsers.length > 0
                ? "text-white"
                : "text-gray-500 dark:text-gray-300"
            }`}
          >
            Add
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full h-full">
        <UserMultiSelectList
          selectedUsers={selectedUsers}
          onChange={setSelectedUsers}
          searchPlaceholder="Add participants…"
          conversationId={conversationId}
        />
      </View>
    </Animated.View>
  );
}
