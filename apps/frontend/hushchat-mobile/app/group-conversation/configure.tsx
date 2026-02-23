import MobileGroupCreation from "@/components/conversations/conversation-list/group-conversation-creation/mobile/MobileGroupCreation";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

const GroupConfiguration = () => {
  const { userIds, addAllWorkspaceUsers } = useLocalSearchParams<{
    userIds?: string;
    addAllWorkspaceUsers?: string;
  }>();

  const participantUserIds = useMemo<number[]>(() => {
    return userIds ? JSON.parse(userIds) : [];
  }, [userIds]);

  return (
    <MobileGroupCreation
      participantUserIds={participantUserIds}
      addAllWorkspaceUsers={addAllWorkspaceUsers === "true"}
    />
  );
};

export default GroupConfiguration;
