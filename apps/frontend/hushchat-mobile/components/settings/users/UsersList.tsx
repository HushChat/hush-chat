import SearchBar from "@/components/SearchBar";
import { View, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useGetAllWorkspaceUsersQuery } from "@/query/useGetAllWorkspaceUsersQuery";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeFirstLetter, getAPIErrorMsg } from "@/utils/commonUtils";
import { router } from "expo-router";
import { CONVERSATION } from "@/constants/routes";
import { useUserStore } from "@/store/user/useUserStore";
import { useCreateOneToOneConversationMutation } from "@/query/post/queries";
import { getCriteria } from "@/utils/conversationUtils";
import { ConversationType } from "@/types/chat/types";
import { ToastUtils } from "@/utils/toastUtils";
import { debounce } from "lodash";
import { DEFAULT_STATUS_COLORS, STATUS_COLORS } from "./Users";

interface UsersListProps {
  onUserSelect: (user: IWorkspaceUser) => void;
  selectedUserId?: number;
}

interface UserCardProps {
  user: IWorkspaceUser;
  currentUserEmail: string;
  onChatBubblePress: (user: IWorkspaceUser) => void;
  onPress: (user: IWorkspaceUser) => void;
  isSelected: boolean;
}

const UserCard = ({
  user,
  currentUserEmail,
  onChatBubblePress,
  onPress,
  isSelected,
}: UserCardProps) => {
  const fullName = `${user.firstName} ${user.lastName}`;
  const statusColors =
    STATUS_COLORS[user.status as keyof typeof STATUS_COLORS] || DEFAULT_STATUS_COLORS;

  const isCurrentUser = currentUserEmail === user.email;

  return (
    <TouchableOpacity
      className={`flex-row items-center p-3 mb-2 mx-2 border rounded-lg ${
        isSelected
          ? "border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10"
          : "border-gray-200 dark:border-gray-800"
      } hover:bg-gray-50 dark:hover:bg-gray-800`}
      onPress={() => onPress(user)}
    >
      <InitialsAvatar
        name={fullName}
        size={AvatarSize.small}
        imageUrl={user.imageIndexedName}
        userStatus={user.chatUserStatus}
        showOnlineStatus={true}
      />

      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <AppText className="font-semibold text-gray-900 dark:text-white">{fullName}</AppText>
            <View className={`px-2 py-1 rounded ${statusColors.bg}`}>
              <AppText className={`text-xs ${statusColors.text}`}>
                {capitalizeFirstLetter(user.status)}
              </AppText>
            </View>
          </View>

          <AppText className="text-xs text-gray-500 dark:text-gray-400">2h ago</AppText>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          <AppText className="text-sm text-gray-600 dark:text-gray-400">{user.email}</AppText>
          {!isCurrentUser && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onChatBubblePress(user);
              }}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasPrevPage: boolean;
}

const PaginationFooter = ({
  currentPage,
  totalPages,
  onPageChange,
  hasPrevPage,
}: PaginationFooterProps) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    let start = Math.max(2, currentPage - 1);
    const end = Math.min(start + 2, totalPages - 1);

    if (end === totalPages - 1) {
      start = Math.max(2, end - 2);
    }

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const renderPageButton = (page: number | string) => {
    if (page === "...") {
      return (
        <View key={`dots-${Math.random()}`} className="w-7 h-7 items-center justify-center">
          <AppText className="text-gray-600 dark:text-gray-400">…</AppText>
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={page}
        onPress={() => onPageChange(page as number)}
        className={`w-7 h-7 items-center justify-center rounded-full ${
          currentPage === page ? "bg-primary-light dark:bg-primary-dark" : "bg-transparent"
        }`}
      >
        <AppText
          className={`${
            currentPage === page ? "text-white font-semibold" : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {page}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-row items-center justify-center gap-3 py-4 bg-white dark:bg-background-dark">
      <TouchableOpacity
        onPress={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`w-10 h-10 items-center justify-center rounded-full border ${
          !hasPrevPage
            ? "border-gray-200 dark:border-gray-800"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <Ionicons name="chevron-back" size={18} color={!hasPrevPage ? "#D1D5DB" : "#6B7280"} />
      </TouchableOpacity>

      {getPageNumbers().map((page) => renderPageButton(page))}

      <TouchableOpacity
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={`w-10 h-10 items-center justify-center rounded-full border ${
          currentPage >= totalPages
            ? "border-gray-200 dark:border-gray-800"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <Ionicons
          name="chevron-forward"
          size={18}
          color={currentPage >= totalPages ? "#D1D5DB" : "#6B7280"}
        />
      </TouchableOpacity>
    </View>
  );
};

export default function UsersList({ onUserSelect, selectedUserId }: UsersListProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const currentUserEmail = user?.email || "";
  const criteria = getCriteria(ConversationType.ALL);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const debouncedUpdateQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedUpdateQuery.cancel();
    };
  }, [debouncedUpdateQuery]);

  const onSearchTextChange = (text: string) => {
    setSearchText(text);
    debouncedUpdateQuery(text);
  };

  const { workspaceUsersPages, fetchNextPage, isFetchingNextPage } =
    useGetAllWorkspaceUsersQuery(searchQuery);

  const currentPageData = workspaceUsersPages?.pages[currentPage - 1];
  const users = currentPageData?.content ?? [];
  const totalPages = currentPageData?.totalPages ?? 1;

  const createConversation = useCreateOneToOneConversationMutation(
    { userId: currentUserId, criteria },
    (conversation) => {
      router.replace(CONVERSATION(conversation.id));
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const totalLoadedPages = workspaceUsersPages?.pages?.length ?? 0;
    if (page > totalLoadedPages) {
      fetchNextPage().then(() => setCurrentPage(page));
    } else {
      setCurrentPage(page);
    }
  };

  const handleChatBubblePress = (user: IWorkspaceUser) => {
    const conversationId = user.conversationId;
    if (conversationId) {
      router.replace(CONVERSATION(conversationId));
    } else {
      createConversation.mutate(user.id);
    }
  };

  return (
    <View className="flex-1">
      <View className="my-2 px-2 sm:px-4">
        <SearchBar
          value={searchText}
          onChangeText={onSearchTextChange}
          onClear={() => onSearchTextChange("")}
          placeholder="Search users..."
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <UserCard
            user={item}
            currentUserEmail={currentUserEmail}
            onChatBubblePress={handleChatBubblePress}
            onPress={onUserSelect}
            isSelected={selectedUserId === item.id}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-8 items-center">
            <AppText className="text-gray-500 dark:text-gray-400">No users found</AppText>
          </View>
        }
      />

      {users.length > 0 && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          hasPrevPage={currentPage > 1}
        />
      )}

      {isFetchingNextPage && (
        <View className="py-2 items-center">
          <ActivityIndicator size="small" />
        </View>
      )}
    </View>
  );
}
