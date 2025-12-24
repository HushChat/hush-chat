import { gifQueryKeys } from "@/constants/queryKeys";
import { getTrendingGifs } from "@/services/gifService";
import { useUserStore } from "@/store/user/useUserStore";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function useGetTrendingGifsQuery() {
  const {
    user: { id: userId },
  } = useUserStore();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: gifQueryKeys.trendingGifs(Number(userId)),
      initialPageParam: "",
      queryFn: ({ pageParam }) => getTrendingGifs(20, pageParam as string),
      getNextPageParam: (lastPage: any) => {
        return lastPage.next && lastPage.next !== "" ? lastPage.next : undefined;
      },
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
