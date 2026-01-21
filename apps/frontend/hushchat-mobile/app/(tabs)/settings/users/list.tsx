import { View } from "react-native";
import { router } from "expo-router";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { AppText } from "@/components/AppText";
import BackButton from "@/components/BackButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { USER_DETAILS } from "@/constants/routes";
import UsersList from "@/components/settings/users/UsersList";
import { PLATFORM } from "@/constants/platformConstants";
import Users from "@/components/settings/users/Users";
import SettingsWrapper from "@/components/settings/Settings";

export default function UsersListScreen() {
  const insets = useSafeAreaInsets();

  const handleUserSelect = (user: IWorkspaceUser) => {
    router.push(USER_DETAILS(user.id));
  };

  if (PLATFORM.IS_WEB) {
    return (
      <SettingsWrapper>
        <Users />
      </SettingsWrapper>
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
            All Users
          </AppText>
        </View>
      </View>

      <UsersList onUserSelect={handleUserSelect} />
    </View>
  );
}
