import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";
import useGlobalSearchQuery from "@/query/useGlobalSearchQuery";

export const useConversationSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchQuery.cancel();
    };
  }, [debouncedSearchQuery]);

  const { searchResults, isSearching, searchError, refetchSearch } =
    useGlobalSearchQuery(searchQuery);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearchQuery(value);
    },
    [debouncedSearchQuery]
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
