/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
