package com.platform.software.platform.workspaceuser.service;

import com.platform.software.config.security.model.UserDetails;
import com.platform.software.exception.CustomAccessDeniedException;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.platform.workspace.dto.*;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.entity.WorkspaceStatus;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserRole;
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

            workspaceUser.setStatus(WorkspaceUserStatus.ACTIVE);
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

    public WorkspaceUser getWorkspaceUserByEmailAndWorkspaceIdentifier(String email, String workspaceIdentifier) {
        return WorkspaceUtils.runInGlobalSchema(() -> {
            WorkspaceUser existingUser = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                    email, workspaceIdentifier).orElse(null);
            return existingUser;
        });
    }

    /**
     * Suspend or unsuspend a workspace user.
     *
     * @param requesterEmail          The email of the user making the request.
     * @param workspaceIdentifier     The identifier of the workspace.
     * @param workspaceUserSuspendDTO The DTO containing the email of the user to be suspended/unsuspended.
     * @throws CustomAccessDeniedException if the requester is not an admin or if the requester is not found in the workspace.
     * @throws CustomBadRequestException   if the user to be suspended/unsuspended is not found in the workspace.
     */
    public void toggleSuspendWorkspaceUser(String requesterEmail, String workspaceIdentifier, WorkspaceUserSuspendDTO workspaceUserSuspendDTO) {
        WorkspaceUtils.runInGlobalSchema(() -> {
            transactionTemplate.executeWithoutResult(status -> {
                WorkspaceUser requester = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                        requesterEmail, workspaceIdentifier).orElseThrow(() -> new CustomAccessDeniedException("Requester not found in any workspace."));

                if (requester.getRole() != WorkspaceUserRole.ADMIN) {
                    throw new CustomBadRequestException("Only admins can suspend/unsuspend users.");
                }

                WorkspaceUser userToSuspend = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                        workspaceUserSuspendDTO.getEmail(), workspaceIdentifier)
                        .orElseThrow(() -> new CustomBadRequestException("User to suspend not found in the workspace."));

                userToSuspend.setStatus(
                        userToSuspend.getStatus() == WorkspaceUserStatus.SUSPENDED
                                ? WorkspaceUserStatus.ACTIVE
                                : WorkspaceUserStatus.SUSPENDED
                );

                workspaceUserRepository.save(userToSuspend);
                logger.info("User: {} has been {} by requester: {} in workspace: {}",
                        workspaceUserSuspendDTO.getEmail(),
                        userToSuspend.getStatus().toString(),
                        requesterEmail,
                        workspaceIdentifier);
            });
        });
    }

    /**
     * Validates if a user has access to a specific workspace.
     *
     * @param workspaceIdentifier The identifier of the workspace.
     * @param email               The email of the user.
     * @return workspaceUser if the user has access to the workspace, null otherwise.
     */
    public WorkspaceUser validateWorkspaceAccess(String workspaceIdentifier, String email) {
        WorkspaceUser workspaceUser = WorkspaceUtils.runInGlobalSchema(
                () -> workspaceUserRepository.validateWorkspaceAccess(workspaceIdentifier, email)
        );

        if (workspaceUser == null) {
            logger.info(
                    "Workspace access denied for user: {} on workspace: {}",
                    email,
                    workspaceIdentifier
            );
        }
        return workspaceUser;
    }

    /**
     * Updates the role of a user within a workspace by toggling between ADMIN and MEMBER roles.
     * This operation requires the requesting user to have ADMIN privileges in the workspace.
     * The method executes within a global schema context and uses transaction management.
     *
     * @param userDetails the authenticated user's details who is requesting the role update.
     *                    Must have ADMIN role in the specified workspace.
     * @param workspaceIdentifier the unique identifier of the workspace where the role update occurs.
     *                           Used to locate both the requesting admin and the target user.
     * @param targetUserEmail the string containing the email address of the user whose role
     *                                   needs to be updated.
     *
     * @throws CustomAccessDeniedException if the requesting user does not have ADMIN privileges
     *                                     in the specified workspace.
     * @throws CustomBadRequestException if the target user is not found in the workspace or if
     *                                   the role update operation fails.
     *
     * @see WorkspaceUserRole
     * @see WorkspaceUserRoleUpdateDTO
     * @see UserDetails
     */
    public void toggleUserRole(UserDetails userDetails, String workspaceIdentifier, String targetUserEmail) {
        WorkspaceUtils.runInGlobalSchema(() -> {
            transactionTemplate.executeWithoutResult(status -> {
                WorkspaceUser requester = workspaceUserRepository.findByEmailAndRoleAndWorkspace_WorkspaceIdentifier(
                        userDetails.getEmail(), WorkspaceUserRole.ADMIN, workspaceIdentifier).orElseThrow(() -> new CustomAccessDeniedException("User Has No Admin privilege"));

                if (requester.getEmail().equals(targetUserEmail)) {
                    logger.warn("admin {} attempted to change their own role", requester.getEmail());
                    throw new CustomBadRequestException("You Cannot Change Your Own Role");
                }

                WorkspaceUser targetUser = workspaceUserRepository.findByEmailAndWorkspace_WorkspaceIdentifier(
                                targetUserEmail, workspaceIdentifier)
                        .orElseThrow(() -> new CustomBadRequestException("User Not Found In This Workspace"));

                try {
                    targetUser.setRole(
                            targetUser.getRole() == WorkspaceUserRole.MEMBER ? WorkspaceUserRole.ADMIN : WorkspaceUserRole.MEMBER
                    );

                    workspaceUserRepository.save(targetUser);
                    logger.info("user: {} has become a  {} by requester: {} in workspace: {}",
                            targetUserEmail,
                            targetUser.getRole().toString(),
                            userDetails.getEmail(),
                            workspaceIdentifier
                    );
                } catch (Exception e) {
                    logger.info("failed to change role for user: {} by user: {} to workspace: {}. Error: {}", targetUserEmail, userDetails.getEmail(), workspaceIdentifier, e.getMessage());
                    throw new CustomBadRequestException("Update User Role Failed");
                }
            });
        });
    }
}
