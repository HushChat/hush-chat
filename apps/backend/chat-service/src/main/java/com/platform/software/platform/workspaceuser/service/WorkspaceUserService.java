package com.platform.software.platform.workspaceuser.service;

import com.platform.software.exception.CustomAccessDeniedException;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.platform.workspace.dto.WorkspaceDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;

@Service
public class WorkspaceUserService {

    private final WorkspaceUserRepository workspaceUserRepository;
    private final TransactionTemplate transactionTemplate;
    Logger logger = LoggerFactory.getLogger(WorkspaceUserService.class);


    public WorkspaceUserService(WorkspaceUserRepository workspaceUserRepository, TransactionTemplate transactionTemplate) {
        this.workspaceUserRepository = workspaceUserRepository;
        this.transactionTemplate = transactionTemplate;
    }

    public WorkspaceDTO verifyUserAccessToWorkspace(String email, Long workspaceId) {
        WorkspaceUser user = workspaceUserRepository.findByEmailAndWorkspace_Id(email, workspaceId)
                .orElseThrow(() -> new CustomAccessDeniedException("You dont have permission to access this workspace or invalid workspace id"));

        return new WorkspaceDTO(user.getWorkspace());
    }

    public WorkspaceDTO verifyUserAccessToWorkspace(String email, String workspaceName) {
        WorkspaceUser user = workspaceUserRepository.findByEmailAndWorkspace_Name(email, workspaceName)
                .orElseThrow(() -> new CustomAccessDeniedException("You dont have permission to access this workspace or invalid name"));

        return new WorkspaceDTO(user.getWorkspace());
    }

    public List<Workspace> getAllWorkspaces(String email) {
        return WorkspaceUtils.runInGlobalSchema(() -> {
            List<WorkspaceUser> workspaceUsers = workspaceUserRepository.findAllByEmail(email);
            return workspaceUsers.stream().map(WorkspaceUser::getWorkspace).toList();
        });
    }

    public Workspace getInvitedWorkspace(String email) {
        return WorkspaceUtils.runInGlobalSchema(() -> workspaceUserRepository.findPendingWorkspaceByUserEmailOrThrow(email));
    }

    public void markInvitationAsAccepted(String email, Long workspaceId) {
        WorkspaceUtils.runInGlobalSchema(() -> {
            WorkspaceUser workspaceUser = workspaceUserRepository.findByEmailAndWorkspace_Id(email, workspaceId)
                    .orElseThrow(() -> new CustomAccessDeniedException("No invitation found for the given email and workspace"));

            workspaceUser.setStatus(WorkspaceUserStatus.ACCEPTED);
            workspaceUserRepository.save(workspaceUser);
        });
    }

    public void inviteUserToWorkspace(String inviterEmail, String workspaceIdentifier, WorkspaceUserInviteDTO workspaceUserInviteDTO) {
        WorkspaceUtils.runInGlobalSchema(() -> {
            transactionTemplate.executeWithoutResult(status -> {
                WorkspaceUser existingUser = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                        workspaceUserInviteDTO.getEmail(), workspaceIdentifier).orElse(null);

                if (existingUser != null) {
                    throw new CustomBadRequestException("User is already a member of this workspace.");
                }

                try {
                    Workspace workspace = workspaceUserRepository.validateWorkspaceMembershipOrThrow(inviterEmail, workspaceIdentifier);
                    WorkspaceUser newWorkspaceUser =
                            WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, workspace, inviterEmail);
                    workspaceUserRepository.save(newWorkspaceUser);
                } catch (Exception e) {
                    logger.info("Failed to invite user: {} to workspace: {}. Error: {}", workspaceUserInviteDTO.getEmail(), workspaceIdentifier, e.getMessage());
                }
            });
        });

    }
}
