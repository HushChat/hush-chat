import { AppText } from "@/components/AppText";
import { View } from "react-native";
import UsersList from "./UsersList";
import { useState } from "react";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { useUserStore } from "@/store/user/useUserStore";
import { getCriteria } from "@/utils/conversationUtils";
import { ConversationType } from "@/types/chat/types";
import { useCreateOneToOneConversationMutation } from "@/query/post/queries";
import { router } from "expo-router";
import { CONVERSATION } from "@/constants/routes";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import UserDetails from "./UserDeails";
import { Ionicons } from "@expo/vector-icons";

export const STATUS_COLORS = {
  ACTIVE: {
    bg: "bg-green-100 dark:bg-green-900/50",
    text: "text-green-600 dark:text-green-300",
  },
  PENDING: {
    bg: "bg-orange-100 dark:bg-orange-900/50",
    text: "text-orange-600 dark:text-orange-300",
  },
  SUSPENDED: {
    bg: "bg-red-100 dark:bg-red-900/50",
    text: "text-red-600 dark:text-red-300",
  },
} as const;

export const DEFAULT_STATUS_COLORS = {
  bg: "bg-gray-100 dark:bg-gray-900",
  text: "text-gray-600 dark:text-gray-300",
};

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<IWorkspaceUser | null>(null);
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const criteria = getCriteria(ConversationType.ALL);

  const createConversation = useCreateOneToOneConversationMutation(
    { userId: currentUserId, criteria },
    (conversation) => {
      router.replace(CONVERSATION(conversation.id));
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleMessagePress = (user: IWorkspaceUser) => {
    const conversationId = user.conversationId;
    if (conversationId) {
      router.replace(CONVERSATION(conversationId));
    } else {
      createConversation.mutate(user.id);
    }
  };

  return (
    <View className="flex-1 flex-row w-full">
      <View className="w-[450px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="p-4">
          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            All Users
          </AppText>
        </View>
        <UsersList onUserSelect={setSelectedUser} selectedUserId={selectedUser?.id} />
      </View>

      <View className="flex-1">
        {selectedUser ? (
          <UserDetails user={selectedUser} onMessagePress={handleMessagePress} />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Ionicons name="person-outline" size={64} color="#9CA3AF" />
            <AppText className="text-gray-500 dark:text-gray-400 mt-4">
              Select a user to view details
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
}
