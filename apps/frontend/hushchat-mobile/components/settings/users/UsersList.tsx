import { ActivityIndicator, FlatList, View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkspaceChatUsersQuery } from "@/query/useWorkspaceChatUsersQuery";
import SearchBar from "@/components/SearchBar";
import InitialsAvatar from "@/components/InitialsAvatar";
import { TUser } from "@/types/user/types";
import useDebounce from "@/hooks/useDebounce";

export default function UsersList() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const debouncedKeyword = useDebounce(searchText, 300);

  const { usersPages, isLoadingUsers, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useWorkspaceChatUsersQuery(debouncedKeyword);

  const users: TUser[] = usersPages?.pages.flatMap((page) => page.content ?? []) ?? [];

  const renderUserItem = ({ item }: { item: TUser }) => {
    const fullName = `${item.firstName} ${item.lastName}`.trim();
    return (
      <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <InitialsAvatar
          name={fullName || "Unknown User"}
          imageUrl={item.signedImageUrl}
          size="sm"
        />
        <View className="flex-1">
          <AppText className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
            {fullName || "Unknown User"}
          </AppText>
          <AppText
            className="text-gray-500 dark:text-text-secondary-dark text-sm"
            numberOfLines={1}
          >
            {item.email}
          </AppText>
        </View>
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 w-[700px]">
      <View
        className="flex-1 px-4 bg-background-light dark:bg-background-dark"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-center mb-6 mt-3">
          {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
          <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
            Workspace Users
          </AppText>
        </View>

        <AppText className="text-base text-gray-500 dark:text-gray-400 mb-4">
          View all users in your workspace.
        </AppText>

        <View className="mb-4">
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search users..."
            onClear={() => setSearchText("")}
          />
        </View>

        {isLoadingUsers ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" />
          </View>
        ) : users.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10">
            <AppText className="text-gray-500 dark:text-gray-400 text-base">
              No users found.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUserItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
}
