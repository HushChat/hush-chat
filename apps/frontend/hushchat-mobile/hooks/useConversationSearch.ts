import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import useGlobalSearchQuery from "@/query/useGlobalSearchQuery";

const SEARCH_DEBOUNCE_DELAY_MS = 500;

export const useConversationSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedUpdateSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, SEARCH_DEBOUNCE_DELAY_MS),
    []
  );

  useEffect(() => {
    return () => {
      debouncedUpdateSearchQuery.cancel();
    };
  }, [debouncedUpdateSearchQuery]);

  const { searchResults, isSearching, searchError, refetchSearch } =
    useGlobalSearchQuery(searchQuery);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedUpdateSearchQuery(value);
    },
    [debouncedUpdateSearchQuery]
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  return {
    searchInput,
    searchResults,
    isSearching,
    searchError,
    refetchSearch,
    handleSearchInputChange,
    handleSearchClear,
  };
};
