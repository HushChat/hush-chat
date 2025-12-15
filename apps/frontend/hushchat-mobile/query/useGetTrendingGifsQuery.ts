import { getTrendingGifs } from "@/services/gifService";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useGetTrendingGifsQuery() {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["gifs", "trending"],
      initialPageParam: "",
      queryFn: ({ pageParam }) => getTrendingGifs(20, pageParam as string),
      getNextPageParam: (lastPage: any) => {
        return lastPage.next && lastPage.next !== "" ? lastPage.next : undefined;
      },
      enabled: true,
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
