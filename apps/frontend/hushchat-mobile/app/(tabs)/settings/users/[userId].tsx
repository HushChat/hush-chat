import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppText } from "@/components/AppText";
import BackButton from "@/components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetAllWorkspaceUsersQuery } from "@/query/useGetAllWorkspaceUsersQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { getCriteria } from "@/utils/conversationUtils";
import { ConversationType } from "@/types/chat/types";
import { useCreateOneToOneConversationMutation } from "@/query/post/queries";
import { CONVERSATION } from "@/constants/routes";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import UserDetails from "@/components/settings/users/UserDeails";
import { PLATFORM } from "@/constants/platformConstants";
import Users from "@/components/settings/users/Users";
import SettingsWrapper from "@/components/settings/Settings";
import UsersIndex from ".";

export default function UserDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const criteria = getCriteria(ConversationType.ALL);

  const { workspaceUsersPages, isLoadingWorkspaceUsers } = useGetAllWorkspaceUsersQuery("");

  const selectedUser = workspaceUsersPages?.pages
    ?.flatMap((page) => page.content)
    ?.find((u) => u.id.toString() === userId);

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

  if (PLATFORM.IS_WEB) {
    return (
      <UsersIndex />
    );
  }

  if (isLoadingWorkspaceUsers) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!selectedUser) {
    return (
      <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
        <AppText className="text-gray-500 dark:text-gray-400">User not found</AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-gray-800"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center gap-3">
          <BackButton onPress={() => router.back()} />
          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            User Details
          </AppText>
        </View>
      </View>

      <UserDetails user={selectedUser} onMessagePress={handleMessagePress} />
    </View>
  );
}
