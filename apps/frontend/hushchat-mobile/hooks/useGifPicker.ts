import { useState, useMemo, useCallback } from "react";
import useGetTrendingGifsQuery from "@/query/useGetTrendingGifsQuery";
import useSearchGifsQuery from "@/query/useSearchGifsQuery";
import useDebounce from "@/hooks/useDebounce";

const SEARCH_DEBOUNCE_MS = 500;

interface UseGifPickerProps {
  onClose: () => void;
  onGifSelect: (gifUrl: string) => void;
}

export const useGifPicker = ({ onClose, onGifSelect }: UseGifPickerProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearch = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const isSearching = debouncedSearch.trim().length > 0;

  const trendingQuery = useGetTrendingGifsQuery();
  const searchQueryObj = useSearchGifsQuery(debouncedSearch);
  const activeQuery = isSearching ? searchQueryObj : trendingQuery;

  const flatGifs = useMemo(() => {
    if (!activeQuery.data || !activeQuery.data.pages) return [];
    return activeQuery.data.pages.flatMap((page: any) => page.results || []);
  }, [activeQuery.data]);

  const handleClose = useCallback(() => {
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (gifUrl: string) => {
      onGifSelect(gifUrl);
      handleClose();
    },
    [onGifSelect, handleClose]
  );

  const loadMore = useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
  }, [activeQuery]);

  return {
    searchQuery,
    setSearchQuery,
    gifs: flatGifs,
    isLoading: activeQuery.isLoading,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    isEmpty: flatGifs.length === 0,
    loadMore,
    handleClose,
    handleSelect,
  };
};
