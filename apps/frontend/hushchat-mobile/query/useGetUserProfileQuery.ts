import { getUserProfile } from "@/apis/user";
import { userQueryKeys } from "@/constants/queryKeys";
import { IUserProfile } from "@/types/user/types";
import { useQuery } from "@tanstack/react-query";

export function useGetUserProfileQuery(userId: number | null): {
  userProfile: IUserProfile | null;
  isLoadingUserProfile: boolean;
  userProfileError: Error | null;
  refetchUserProfile: () => Promise<unknown>;
} {
  const { data, isLoading, error, refetch } = useQuery<IUserProfile>({
    queryKey: userQueryKeys.chatUserProfile(userId),
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  return {
    userProfile: data || null,
    isLoadingUserProfile: isLoading,
    userProfileError: error,
    refetchUserProfile: refetch,
  };
}
