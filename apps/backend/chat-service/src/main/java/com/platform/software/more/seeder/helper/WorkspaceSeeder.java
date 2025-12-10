package com.platform.software.more.seeder.helper;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class WorkspaceSeeder {
    private final ObjectMapper objectMapper;
    private final WorkspaceUserRepository workspaceUserRepository;
    Logger logger = LoggerFactory.getLogger(WorkspaceSeeder.class);

    private final WorkspaceRepository workspaceRepository;

    public WorkspaceSeeder(WorkspaceRepository workspaceRepository, ObjectMapper objectMapper, WorkspaceUserRepository workspaceUserRepository) {
        this.workspaceRepository = workspaceRepository;
        this.objectMapper = objectMapper;
        this.workspaceUserRepository = workspaceUserRepository;
    }

    public void seedWorkspace() {
        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/workspaces/workspaces.json");
            if (inputStream == null) {
                logger.error("workspaces.json file not found");
                return;
            }
            List<Workspace> workspaces = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, Workspace.class));

            workspaceRepository.saveAll(workspaces);

        } catch (IOException e) {
            logger.error("error reading users.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding users: {}", e.getMessage());
        }
    }

    public void seedWorkspaceUsers() {
        logger.info("started seeding chat users");
        List<Workspace> workspaces = workspaceRepository.findAll();

        try {
            InputStream inputStream = getClass().getResourceAsStream("/seed-files/users/users.json");
            if (inputStream == null) {
                logger.error("users.json file not found");
                return;
            }
            List<WorkspaceUser> users = objectMapper.readValue(inputStream,
                objectMapper.getTypeFactory().constructCollectionType(List.class, WorkspaceUser.class));
            List<WorkspaceUser> workspaceUsers = users.stream().map(wu -> {
                wu.setWorkspace(workspaces.stream().findFirst().get());
                wu.setStatus(WorkspaceUserStatus.ACCEPTED);
                return wu;
            }).toList();
            workspaceUserRepository.saveAll(workspaceUsers);
            logger.info("finished seeding chat users: {}", users.size());

        } catch (IOException e) {
            logger.error("error reading users.json file: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("error seeding users: {}", e.getMessage());
        }
    }
}
