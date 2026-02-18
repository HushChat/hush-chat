/**
 * CallLogItem
 *
 * Represents a single call entry in the call history list.
 */

import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { PLATFORM } from "@/constants/platformConstants";
import { CallDirection, Direction, ICallLog } from "@/types/call/types";
import { formatRelativeTime, handleConversationNavigation } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";
import { ListItem } from "@/components/ui/ListItem";
import { Divider } from "@/components/ui/Divider";

type CallItemProps = {
  callLog: ICallLog | null | undefined;
  direction: Direction;
  missed?: boolean;
};

const CallLogItem = ({ callLog, direction, missed }: CallItemProps) => {
  const participants = Array.isArray(callLog?.participants) ? callLog!.participants : [];
  const first = participants[0];
  const name = `${first?.firstName ?? ""} ${first?.lastName ?? ""}`.trim() || "Unknown";

  const timeText = useMemo(
    () => formatRelativeTime(callLog?.callStartedAt),
    [callLog?.callStartedAt]
  );

  const handlePress = useCallback(() => {
    if (callLog) handleConversationNavigation(() => {}, callLog.callLogId);
  }, [callLog]);

  const arrowColor = missed ? "#EF4444" : "#22C55E";
  const arrowName = "arrow-up-outline";
  const arrowRotation = direction === CallDirection.outgoing ? "45deg" : "-135deg";

  const rightIconName = callLog?.isVideo ? "videocam-outline" : "call-outline";

  return (
    <>
      <ListItem
        leading={<InitialsAvatar name={name} onPress={handlePress} />}
        title={name}
        subtitle={
          <View className="flex-row items-center">
            <Ionicons
              name={arrowName}
              size={16}
              color={arrowColor}
              style={{ transform: [{ rotate: arrowRotation }] }}
            />
            <AppText
              className="ml-2 text-text-secondary-light dark:text-text-secondary-dark text-sm flex-1"
              numberOfLines={1}
            >
              {timeText}
            </AppText>
          </View>
        }
        trailing={<Ionicons name={rightIconName} size={20} color="#9CA3AF" />}
        onPress={handlePress}
        className={
          PLATFORM.IS_WEB
            ? "mx-1 rounded-2xl hover:bg-secondary-light dark:hover:bg-secondary-dark cursor-pointer"
            : ""
        }
      />
      <Divider indent={76} />
    </>
  );
};

export default CallLogItem;
