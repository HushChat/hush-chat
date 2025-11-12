package com.platform.software.platform.workspace.service;

import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceUtilService {
    Logger logger = LoggerFactory.getLogger(WorkspaceUtilService.class);

    private final WorkspaceUserRepository workspaceUserRepository;
    private final UserService userService;
    private final WorkspaceRepository workspaceRepository;

    public WorkspaceUtilService(
        WorkspaceRepository workspaceRepository,
        UserService userService,
        WorkspaceUserRepository workspaceUserRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.userService = userService;
        this.workspaceUserRepository = workspaceUserRepository;
    }

    @Transactional
    public void createWorkSpaceAndUser(WorkspaceUpsertDTO workspaceUpsertDTO, String loggedInUserEmail) {
        Workspace workspace = workspaceUpsertDTO.buildWorkspace();
        Workspace savedWorkspace = workspaceRepository.save(workspace);

        // Save workspace user
        WorkspaceUser workspaceUser = new WorkspaceUser();
        workspaceUser.setWorkspace(savedWorkspace);
        workspaceUser.setEmail(loggedInUserEmail);
        workspaceUserRepository.save(workspaceUser);
    }

    @Transactional
    public void createUserForNewSchema(String newWorkspaceName, String loggedInUserEmail) {
        WorkspaceContext.setCurrentWorkspace(newWorkspaceName);
        userService.createUserForNewWorkspace(newWorkspaceName, loggedInUserEmail);
    }
}
