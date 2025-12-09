package com.platform.software.platform.workspaceuser.service;

import com.platform.software.exception.CustomAccessDeniedException;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.platform.workspace.dto.WorkspaceDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.entity.WorkspaceStatus;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class WorkspaceUserService {

    private final WorkspaceUserRepository workspaceUserRepository;
    private final TransactionTemplate transactionTemplate;
    private final WorkspaceUserUtilService workspaceUserUtilService;
    Logger logger = LoggerFactory.getLogger(WorkspaceUserService.class);


    public WorkspaceUserService(WorkspaceUserRepository workspaceUserRepository, TransactionTemplate transactionTemplate, WorkspaceUserUtilService workspaceUserUtilService) {
        this.workspaceUserRepository = workspaceUserRepository;
        this.transactionTemplate = transactionTemplate;
        this.workspaceUserUtilService = workspaceUserUtilService;
    }

    public WorkspaceUser verifyUserAccessToWorkspace(String email, String workspaceName) {
        WorkspaceUser user = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(email, workspaceName)
            .orElseThrow(() -> new CustomAccessDeniedException("You dont have permission to access this workspace or invalid name"));

        return user;
    }

    public List<Workspace> getAllWorkspaces(String email) {
        return WorkspaceUtils.runInGlobalSchema(() -> {
            List<WorkspaceUser> workspaceUsers = workspaceUserRepository.findAllByEmail(email);
            return workspaceUsers.stream().map(WorkspaceUser::getWorkspace).toList();
        });
    }

    public Workspace getInvitedWorkspace(String email, String currantTenant) {
        return WorkspaceUtils.runInGlobalSchema(() -> workspaceUserRepository.findPendingWorkspaceByUserEmailOrThrow(email, currantTenant));
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
        AtomicReference<Workspace> workspace = new AtomicReference<>(new Workspace());
        WorkspaceUtils.runInGlobalSchema(() -> {
            transactionTemplate.executeWithoutResult(status -> {
                WorkspaceUser existingUser = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                        workspaceUserInviteDTO.getEmail(), workspaceIdentifier).orElse(null);

                if (existingUser != null) {
                    throw new CustomBadRequestException("User is already a member of this workspace.");
                }

                try {
                    workspace.set(workspaceUserRepository.validateWorkspaceMembershipOrThrow(inviterEmail, workspaceIdentifier));
                    WorkspaceUser newWorkspaceUser =
                            WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, workspace.get(), inviterEmail);
                    workspaceUserRepository.save(newWorkspaceUser);
                    logger.info("Successfully invited user: {} to workspace: {}", workspaceUserInviteDTO.getEmail(), workspaceIdentifier);
                } catch (Exception e) {
                    logger.info("Failed to invite user: {} to workspace: {}. Error: {}", workspaceUserInviteDTO.getEmail(), workspaceIdentifier, e.getMessage());
                    throw new CustomBadRequestException("Failed to invite user to workspace: " + e.getMessage());
                }
            });
        });
        workspaceUserUtilService.sendInvitationEmail(workspace.get(), workspaceUserInviteDTO.getEmail(), inviterEmail );
    }

    public List<WorkspaceDTO> getAllWorkspaceDTO(String email) {
        try {
            return WorkspaceUtils.runInGlobalSchema(() -> {
                List<WorkspaceUser> workspaceUsers = workspaceUserRepository.findAllByEmail(email);

                return workspaceUsers.stream()
                        .filter(workspaceUser -> workspaceUser.getWorkspace().getStatus() != WorkspaceStatus.PENDING)
                        .map(workspaceUser ->
                                new WorkspaceDTO(
                                        workspaceUser.getWorkspace(),
                                        workspaceUser.getStatus()
                                )
                        )
                        .toList();
            });
        } catch (Exception e) {
            return List.of();
        }
    }
}
