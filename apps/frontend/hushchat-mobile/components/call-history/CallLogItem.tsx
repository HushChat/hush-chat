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
 * CallLogItem
 *
 * Represents a single call entry in the call history list.
 * This component is a reusable UI item for rendering individual call logs
 * inside the call history panel.
 */

import React, { useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import { CallDirection, Direction, ICallLog } from "@/types/call/types";
import {
  formatRelativeTime,
  handleConversationNavigation,
} from "@/utils/commonUtils";

type CallItemProps = {
  callLog: ICallLog | null | undefined;
  direction: Direction;
  missed?: boolean;
};

const CallLogItem = ({ callLog, direction, missed }: CallItemProps) => {
  const participants = Array.isArray(callLog?.participants)
    ? callLog!.participants
    : [];
  const first = participants[0];
  const name =
    `${first?.firstName ?? ""} ${first?.lastName ?? ""}`.trim() || "Unknown";

  const timeText = useMemo(
    () => formatRelativeTime(callLog?.callStartedAt),
    [callLog?.callStartedAt],
  );

  const handleAvatarPress = useCallback(() => {
    if (callLog) handleConversationNavigation(() => {}, callLog.callLogId);
  }, [callLog]);

  const arrowColor = missed ? "#ef4444" : "#22c55e";
  const arrowName = "arrow-up-outline";
  const arrowRotation =
    direction === CallDirection.outgoing ? "45deg" : "-135deg";

  const rightIconName = callLog?.isVideo ? "videocam-outline" : "call-outline";
  const rightIconColor = "#9ca3af";

  return (
    <View
      className={classNames(
        "flex-row items-center px-4 py-3",
        PLATFORM.IS_WEB &&
          "mx-1 rounded-2xl hover:bg-blue-100/60 hover:dark:bg-secondary-dark cursor-pointer",
      )}
    >
      <TouchableOpacity
        onPress={handleAvatarPress}
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
      >
        <InitialsAvatar name={name} />
      </TouchableOpacity>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            numberOfLines={1}
            className="text-text-primary-light dark:text-text-primary-dark font-medium text-base"
          >
            {name}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons
            name={arrowName}
            size={16}
            color={arrowColor}
            style={{ transform: [{ rotate: arrowRotation }] }}
          />
          <Text
            numberOfLines={1}
            className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-sm flex-1"
          >
            {timeText}
          </Text>
        </View>
      </View>
      <View className="ml-3">
        <Ionicons name={rightIconName} size={20} color={rightIconColor} />
      </View>
    </View>
  );
};

export default CallLogItem;
