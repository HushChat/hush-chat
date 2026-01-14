import React, { useState } from "react";
import { MultiSelectList } from "@/components/MultiSelectList";
import { SelectedChip } from "@/components/SelectedChip";
import { SelectableListItem } from "@/components/SelectableListItem";
import { useGetAllUsersQuery } from "@/query/useGetAllUsersQuery";
import { TUser } from "@/types/user/types";
import { PaginatedResponse } from "@/types/common/types";
import useDebounce from "@/hooks/useDebounce";

const SEARCH_DEBOUNCE_MS = 500;

export interface UserMultiSelectListProps {
  selectedUsers: TUser[];
  onChange: (nextSelected: TUser[]) => void;
  searchPlaceholder?: string;
  conversationId?: number;
  autoFocusSearch?: boolean;
}

export const UserMultiSelectList = ({
  selectedUsers,
  onChange,
  searchPlaceholder = "Search users...",
  conversationId,
  autoFocusSearch = false,
}: UserMultiSelectListProps) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, SEARCH_DEBOUNCE_MS).trim();

  const {
    usersPages,
    isLoadingUsers,
    usersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetAllUsersQuery(debouncedSearch, conversationId);

  return (
    <MultiSelectList<TUser>
      selected={selectedUsers}
      onChange={onChange}
      searchText={searchText}
      setSearchText={setSearchText}
      searchPlaceholder={searchPlaceholder}
      autoFocusSearch={autoFocusSearch}
      queryResult={{
        pages: usersPages,
        isLoading: isLoadingUsers,
        error: usersError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
      }}
      getKey={(u) => u.id}
      extractData={(pages) => {
        const pg = (pages as { pages?: PaginatedResponse<TUser>[] })?.pages ?? [];
        return pg.flatMap((p) => p?.content ?? []);
      }}
      renderItemRow={(user, isSelected, toggle) => (
        <SelectableListItem
          title={`${user.firstName} ${user.lastName}`}
          subtitle={user.email}
          imageUrl={user.signedImageUrl}
          isSelected={isSelected}
          onToggle={() => toggle(user)}
        />
      )}
      renderChip={(user, remove) => (
        <SelectedChip
          key={user.id}
          label={`${user.firstName} ${user.lastName}`}
          onRemove={() => remove(user)}
        />
      )}
    />
  );
};
