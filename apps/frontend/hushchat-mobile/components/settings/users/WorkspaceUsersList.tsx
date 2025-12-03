import React, { useMemo } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { ToastUtils } from "@/utils/toastUtils";
import { AppText } from "@/components/AppText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWorkspaceUsersQuery } from "@/query/useWorkspaceUsersQuery";
import { WorkspaceUser } from "@/types/user/types";
import { WorkspaceUserRow } from "@/components/settings/users/WorkspaceUserRow";
import { PLATFORM } from "@/constants/platformConstants";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { useToggleSuspendUserMutation } from "@/query/delete/queries";

export const WorkspaceUsersList = () => {
  const { pages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useWorkspaceUsersQuery();

  const allUsers = useMemo(
    () => pages?.pages?.flatMap((page) => (page.content as WorkspaceUser[]) || []) || [],
    [pages]
  );

  const { openModal, closeModal } = useModalContext();
  const insets = useSafeAreaInsets();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const toggleSuspend = (email: string) => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: "Suspend User",
      description: "Are you sure you want to suspend this user from the workspace?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Suspend",
          onPress: () =>
            handleToggleSuspendUser.mutate({
              email,
            }),
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "exit-outline",
    });
  };

  const handleToggleSuspendUser = useToggleSuspendUserMutation(
    {},
    async () => {
      closeModal();
      ToastUtils.success("User suspended successfully.");
      await refetch();
    },
    (error) => {
      closeModal();
      ToastUtils.error((error as string) || "Failed to suspend user.");
    }
  );

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark px-4"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center mb-2">
        {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          Workspace Users
        </AppText>
      </View>

      <FlatList
        data={allUsers}
        renderItem={({ item }) => (
          <WorkspaceUserRow user={item} showMenu={true} onToggleSuspend={toggleSuspend} />
        )}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading || isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator
        className="flex-1 bg-background-light dark:bg-background-dark custom-scrollbar"
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContentContainer: {
    paddingBottom: 0,
  },
});
