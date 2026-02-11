import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SearchBar from "@/components/SearchBar";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { TWorkspaceUser, useGetAllWorkspaceUsersQuery } from "@/query/useGetAllWorkspaceUsersQuery";
import useDebounce from "@/hooks/useDebounce";

const STATUS_STYLES: Record<string, { badge: string; text: string }> = {
  ACTIVE: {
    badge: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  PENDING: {
    badge: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-400",
  },
  SUSPENDED: {
    badge: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <View className={`rounded-full px-2 py-1 ${style.badge}`}>
      <AppText className={`text-xs font-medium ${style.text}`}>
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </AppText>
    </View>
  );
}

function UserRow({ user }: { user: TWorkspaceUser }) {
  const fullName = `${user.firstName} ${user.lastName}`;
  return (
    <Pressable className="flex-row items-center px-6 py-4 hover:bg-blue-100/60 hover:dark:bg-secondary-dark">
      <InitialsAvatar name={fullName} size={AvatarSize.medium} />
      <View className="flex-1 ml-3">
        <AppText className="text-base font-medium text-gray-900 dark:text-white">
          {fullName}
        </AppText>
        <AppText className="text-sm text-gray-500 dark:text-gray-400">{user.email}</AppText>
      </View>
      <StatusBadge status={user.status} />
    </Pressable>
  );
}

export default function AllUsersPanel() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const debouncedKeyword = useDebounce(searchText, 300);

  const { usersPages, isLoadingUsers, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetAllWorkspaceUsersQuery(debouncedKeyword);

  const users = useMemo(() => {
    if (!usersPages?.pages) return [];
    return usersPages.pages.flatMap((page) => page.content);
  }, [usersPages]);

  const handleClearSearch = useCallback(() => setSearchText(""), []);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingUsers) return null;
    return (
      <View className="flex-1 items-center justify-center py-12">
        <AppText className="text-gray-500 dark:text-gray-400">No users found</AppText>
      </View>
    );
  };

  return (
    <View className="flex-1 w-[700px] bg-background-light dark:bg-background-dark">
      <View className="flex-1" style={{ paddingTop: insets.top + 12 }}>
        <View className="px-4">
          <View className="flex-row items-center mb-4 mt-3">
            {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
              All Users
            </AppText>
          </View>

          <AppText className="text-base text-gray-500 dark:text-gray-400 mb-4">
            View all users in this workspace.
          </AppText>

          <View className="mb-4">
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search users..."
              onClear={handleClearSearch}
            />
          </View>
        </View>

        {isLoadingUsers ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <UserRow user={item} />}
            onEndReached={() => {
              if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            className="custom-scrollbar"
          />
        )}
      </View>
    </View>
  );
}
