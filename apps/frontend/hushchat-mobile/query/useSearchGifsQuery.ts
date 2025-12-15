import { searchTenorGifs } from "@/services/gifService";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useSearchGifsQuery(searchQuery: string) {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["gifs", "search", searchQuery],
      initialPageParam: "",
      queryFn: ({ pageParam }) => searchTenorGifs(searchQuery, 20, pageParam as string),
      getNextPageParam: (lastPage: any) => {
        return lastPage.next && lastPage.next !== "" ? lastPage.next : undefined;
      },
      enabled: searchQuery.trim().length > 0,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    });

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}
