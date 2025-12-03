import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/apis/user";
import { Workspace } from "@/types/login/types";
import { useUserStore } from "@/store/user/useUserStore";
import { userQueryKeys } from "@/constants/queryKeys";

export function useUserWorkspacesQuery(): {
  workspaces: Workspace[] | [];
  isLoadingWorkspaces: boolean;
  workspacesError: Error | null;
  refetchWorkspaces: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const { data, isLoading, error, refetch } = useQuery<Workspace[]>({
    queryKey: userQueryKeys.userWorkspace(Number(userId)),
    queryFn: () => getUserWorkspaces(),
  });

  return {
    workspaces: data || [],
    isLoadingWorkspaces: isLoading,
    workspacesError: error,
    refetchWorkspaces: refetch,
  };
}
