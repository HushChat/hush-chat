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

import React, { ReactElement, useCallback, useMemo } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PagePaginatedQueryResult } from "@/query/usePaginatedQuery";

export interface MultiSelectListProps<T, TPages = unknown> {
  selected: T[];
  onChange: (next: T[]) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  searchPlaceholder?: string;
  queryResult: PagePaginatedQueryResult<TPages>;
  getKey: (item: T) => string | number;
  extractData: (pages?: TPages) => T[];
  renderItemRow: (
    item: T,
    isSelected: boolean,
    toggle: (i: T) => void,
  ) => ReactElement;
  renderChip: (item: T, remove: (i: T) => void) => ReactElement;
}

export function MultiSelectList<T>({
  selected,
  onChange,
  searchText,
  setSearchText,
  searchPlaceholder = "Search...",
  queryResult,
  getKey,
  extractData,
  renderItemRow,
  renderChip,
}: MultiSelectListProps<T>) {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = queryResult;

  const allItems = useMemo(() => extractData(pages), [pages, extractData]);

  const selectedIds = useMemo(
    () => new Set(selected.map(getKey)),
    [selected, getKey],
  );

  const handleToggle = useCallback(
    (item: T) => {
      const key = getKey(item);
      const next = selectedIds.has(key)
        ? selected.filter((s) => getKey(s) !== key)
        : [...selected, item];
      onChange(next);
    },
    [selected, selectedIds, onChange, getKey],
  );

  const handleRemove = useCallback(
    (item: T) => {
      const next = selected.filter((s) => getKey(s) !== getKey(item));
      onChange(next);
    },
    [selected, onChange, getKey],
  );

  const clearAll = useCallback(() => onChange([]), [onChange]);

  const renderRow: ListRenderItem<T> = ({ item }) =>
    renderItemRow(item, selectedIds.has(getKey(item)), handleToggle);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark custom-scrollbar">
      {selected.length > 0 && (
        <View className="px-4 pt-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Selected ({selected.length})
            </Text>
            <TouchableOpacity onPress={clearAll}>
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Deselect all
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator
            data={selected}
            keyExtractor={(item) => String(getKey(item))}
            renderItem={({ item }) => renderChip(item, handleRemove)}
          />
        </View>
      )}

      <View className="px-4 py-3">
        <View className="flex-row items-center rounded-lg px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder={searchPlaceholder}
            className="flex-1 ml-3 text-gray-900 dark:text-white outline-none"
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={allItems}
        keyExtractor={(item) => String(getKey(item))}
        renderItem={renderRow}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={() => {
          if (isLoading)
            return <Text className="text-center mt-4">Loading...</Text>;
          if (error)
            return (
              <Text className="text-center mt-4" onPress={refetch}>
                Error loading data (tap to retry)
              </Text>
            );
          return <Text className="text-center mt-4">No results</Text>;
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : null
        }
      />
    </View>
  );
}
