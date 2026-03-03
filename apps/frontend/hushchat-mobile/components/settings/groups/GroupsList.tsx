import { ActivityIndicator, FlatList, Switch, View } from "react-native";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { AppText } from "@/components/AppText";
import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAdminGroupsQuery } from "@/query/useAdminGroupsQuery";
import SearchBar from "@/components/SearchBar";
import InitialsAvatar from "@/components/InitialsAvatar";
import useDebounce from "@/hooks/useDebounce";
import { useToggleGroupDisabledMutation } from "@/query/patch/queries";
import { AdminGroupListItem } from "@/apis/admin-conversation";

export default function GroupsList() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const debouncedKeyword = useDebounce(searchText, 300);

  const { groupsPages, isLoadingGroups, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAdminGroupsQuery(debouncedKeyword);

  const serverGroups: AdminGroupListItem[] =
    groupsPages?.pages.flatMap((page) => page.content ?? []) ?? [];

  const [localOverrides, setLocalOverrides] = useState<Record<number, boolean>>({});

  const groups = useMemo(
    () =>
      serverGroups.map((g) => ({
        ...g,
        disabled: localOverrides[g.id] !== undefined ? localOverrides[g.id] : g.disabled,
      })),
    [serverGroups, localOverrides]
  );

  const { mutate: toggleDisabled } = useToggleGroupDisabledMutation();

  const handleToggle = (group: AdminGroupListItem) => {
    const newDisabled = !group.disabled;
    setLocalOverrides((prev) => ({ ...prev, [group.id]: newDisabled }));
    toggleDisabled({ conversationId: group.id, disabled: newDisabled });
  };

  const renderGroupItem = ({ item }: { item: AdminGroupListItem }) => (
    <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <InitialsAvatar
        name={item.name || "Unknown Group"}
        imageUrl={item.signedImageUrl}
        size="sm"
      />
      <View className="flex-1">
        <AppText className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
          {item.name || "Unknown Group"}
        </AppText>
      </View>
      <Switch value={!item.disabled} onValueChange={() => handleToggle(item)} />
    </View>
  );

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
            Workspace Groups
          </AppText>
        </View>

        <AppText className="text-base text-gray-500 dark:text-gray-400 mb-4">
          Manage group conversations in your workspace.
        </AppText>

        <View className="mb-4">
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search groups..."
            onClear={() => setSearchText("")}
          />
        </View>

        {isLoadingGroups ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" />
          </View>
        ) : groups.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10">
            <AppText className="text-gray-500 dark:text-gray-400 text-base">
              No groups found.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderGroupItem}
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
