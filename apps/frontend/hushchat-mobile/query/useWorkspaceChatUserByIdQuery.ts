import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceChatUserById } from "@/apis/user";
import { TAdminUserView } from "@/types/user/types";
import { workspaceAdminQueryKeys } from "@/constants/queryKeys";

export function useWorkspaceChatUserByIdQuery(userId: number | null) {
  const queryClient = useQueryClient();
  const queryKey = workspaceAdminQueryKeys.chatUserById(userId!);

  const { data, isLoading, error } = useQuery<TAdminUserView>({
    queryKey,
    queryFn: async () => {
      const result = await getWorkspaceChatUserById(userId!);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: userId !== null,
  });

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    user: data ?? null,
    isLoading,
    error,
    invalidateQuery,
  };
}
