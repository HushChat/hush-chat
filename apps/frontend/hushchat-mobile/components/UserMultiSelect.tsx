/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
}

export const UserMultiSelectList = ({
  selectedUsers,
  onChange,
  searchPlaceholder = "Search users...",
  conversationId,
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
        const pg =
          (pages as { pages?: PaginatedResponse<TUser>[] })?.pages ?? [];
        return pg.flatMap((p) => p?.content ?? []);
      }}
      renderItemRow={(user, isSelected, toggle) => (
        <SelectableListItem
          title={`${user.firstName} ${user.lastName}`}
          subtitle={user.email}
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
