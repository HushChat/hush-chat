package com.platform.software.platform.workspace.service;

import com.platform.software.common.service.newschema.SchemaCopyService;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.exception.CustomAccessDeniedException;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.utils.ValidationUtils;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {
    Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    @Value("${spring.datasource.default.schema}")
    private String defaultSchema;

    @Value("${workspaces.api.security.token}")
    private String securityToken;

    private final SchemaCopyService schemaCopyService;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUtilService workspaceUtilService;

    public WorkspaceService(
        SchemaCopyService schemaCopyService,
        WorkspaceRepository workspaceRepository,
        WorkspaceUtilService workspaceUtilService
    ) {
        this.schemaCopyService = schemaCopyService;
        this.workspaceRepository = workspaceRepository;
        this.workspaceUtilService = workspaceUtilService;
    }

    public void createWorkspace(WorkspaceUpsertDTO workspaceUpsertDTO, String loggedInUserEmail) {
        ValidationUtils.validate(workspaceUpsertDTO);

        String newWorkspaceName = workspaceUpsertDTO.getName();
        String originalTenant = WorkspaceContext.getCurrentWorkspace(); // Store original

        try {

            // Check if workspace exists
            if (workspaceRepository.findByWorkspaceIdentifier(newWorkspaceName).isPresent()) {
                throw new CustomBadRequestException("%s already exists".formatted(newWorkspaceName));
            }

            // Create new schema
            schemaCopyService.copySchemaComplete(defaultSchema, newWorkspaceName);

            workspaceUtilService.createWorkSpaceAndUser(workspaceUpsertDTO, loggedInUserEmail);
            workspaceUtilService.createUserForNewSchema(newWorkspaceName, loggedInUserEmail);
        } catch (Exception e) {
            // Cleanup: try to drop the schema if it was created
            try {
                schemaCopyService.dropSchema(newWorkspaceName);
            } catch (Exception cleanupException) {
                logger.error("Failed to cleanup schema after workspace creation failure", cleanupException);
            }

            logger.error("Workspace creation failed for: " + newWorkspaceName, e);
            throw new CustomInternalServerErrorException("Cannot create new workspace at the moment");

        } finally {
            WorkspaceContext.setCurrentWorkspace(originalTenant);
        }
    }

    public List<String> getAllWorkspaces(String token){
        if(!securityToken.equals(token)){
            throw new CustomAccessDeniedException("Access Denied!");
        }

        return WorkspaceUtils.runInGlobalSchema(() -> workspaceRepository.findAllByWorkspaceIdentifierIsNotNull()
                .stream()
                .map(Workspace::getWorkspaceIdentifier)
                .filter(id -> !id.isBlank())
                .toList());
    }
}
