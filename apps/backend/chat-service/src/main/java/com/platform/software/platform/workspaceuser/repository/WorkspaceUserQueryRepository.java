package com.platform.software.platform.workspaceuser.repository;

import com.platform.software.platform.workspace.entity.Workspace;

public interface WorkspaceUserQueryRepository {
    Workspace findPendingWorkspaceByUserEmailOrThrow(String email);
    Workspace validateWorkspaceMembershipOrThrow(String inviterEmail, String workspaceIdentifier);
}
