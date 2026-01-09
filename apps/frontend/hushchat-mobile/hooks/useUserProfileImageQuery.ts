import { useQuery } from "@tanstack/react-query";
import { getUserProfileImage } from "@/apis/user";

export const useUserProfileImageQuery = (userId: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["user-profile-image", userId],
    queryFn: () => getUserProfileImage(userId),
    enabled: enabled && userId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
