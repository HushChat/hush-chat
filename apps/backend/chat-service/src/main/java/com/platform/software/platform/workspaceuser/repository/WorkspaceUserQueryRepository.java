package com.platform.software.platform.workspaceuser.repository;

import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WorkspaceUserQueryRepository {
    Workspace findPendingWorkspaceByUserEmailOrThrow(String email, String currantWorkspace);
    Workspace validateWorkspaceMembershipOrThrow(String inviterEmail, String workspaceIdentifier);
    WorkspaceUser validateWorkspaceAccess(String workspaceIdentifier, String email);
    Page<WorkspaceUser> fetchWorkspaceUsersPage(Pageable pageable, String searchKeyword);
}
