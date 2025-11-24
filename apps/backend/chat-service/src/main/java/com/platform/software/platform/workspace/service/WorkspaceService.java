package com.platform.software.platform.workspace.service;

import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.exception.MigrationException;
import com.platform.software.exception.SchemaCreationException;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceService {
    Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;
    private final DatabaseSchemaService databaseSchemaService;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceUserRepository workspaceUserRepository, DatabaseSchemaService databaseSchemaService) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceUserRepository = workspaceUserRepository;
        this.databaseSchemaService = databaseSchemaService;
    }

    /**
     * Creates a new workspace by performing the full provisioning workflow.
     * <p>
     * The process includes:
     *  - Checking whether a workspace with the same name already exists
     *  - Creating a new database schema for the workspace
     *  - Applying Liquibase migrations to initialize the new schema
     *  - Saving the workspace record in the global schema
     *  - Creating a pending workspace user invite for the requesting user
     * <p>
     * Workspace metadata is stored in the global schema, while each workspace
     * receives its own dedicated database schema for data isolation.
     *
     * @param workspaceUpsertDTO   the workspace creation data
     * @param loggedInUserEmail    the email of the user initiating the creation
     *
     * @throws CustomBadRequestException
     *         if a workspace with the given name already exists or the input is invalid
     *
     * @throws CustomInternalServerErrorException
     *         if the schema creation, migration process, or database operations fail unexpectedly
     *
     * @implNote
     * No Spring-managed transaction is used for schema creation or Liquibase operations.
     * These operations rely on the database and Liquibase to handle their own transactional boundaries.
     */
    public void createWorkspace(WorkspaceUpsertDTO workspaceUpsertDTO, String loggedInUserEmail) {

        //TODO: Add loggedInUserEmail validation

        if (!workspaceUpsertDTO.getName().matches("^[a-zA-Z0-9_]+$")) {
            throw new CustomBadRequestException("Invalid schema name: " + workspaceUpsertDTO.getName());
        }

        if (workspaceRepository.existsByName(workspaceUpsertDTO.getName())) {
            logger.error("Workspace with schema {} already exists", workspaceUpsertDTO.getName());
            throw new CustomBadRequestException("Workspace with schema '" + workspaceUpsertDTO.getName() + "' already exists");
        }

        try {
            databaseSchemaService.createDatabaseSchema(workspaceUpsertDTO.getName());

            databaseSchemaService.applyDatabaseMigrations(workspaceUpsertDTO.getName());

            Workspace workspace = workspaceUpsertDTO.buildWorkspace();

            WorkspaceUtils.runInGlobalSchema(() -> {
                Workspace createdWorkspace = workspaceRepository.save(workspace);
                logger.info("Successfully created workspace with ID: {} and schema: {}", createdWorkspace.getId(), createdWorkspace.getName());

                WorkspaceUserInviteDTO workspaceUserInviteDTO = new WorkspaceUserInviteDTO(loggedInUserEmail);
                WorkspaceUser newWorkspaceUser =
                        WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, createdWorkspace, "");
                workspaceUserRepository.save(newWorkspaceUser);
            });

        } catch (SchemaCreationException e) {
            logger.error("Failed to create schema:", e);
            throw new CustomInternalServerErrorException("Failed to create workspace", e);
        } catch (MigrationException e) {
            logger.error("Failed to apply database migrations for schema", e);
            databaseSchemaService.deleteDatabaseSchema(workspaceUpsertDTO.getName());
            throw new CustomInternalServerErrorException("Failed to create workspace", e);
        } catch (Exception e) {
            logger.error("Failed to create workspace with schema: {}", workspaceUpsertDTO.getName(), e);
            databaseSchemaService.deleteDatabaseSchema(workspaceUpsertDTO.getName());
            throw new CustomInternalServerErrorException("Failed to create workspace", e);
        }
    }

    /**
     * Get names of all available workspaces
     *
     * @return List<String>
     */
    public List<String> getAllWorkspaces(){
        return WorkspaceUtils.runInGlobalSchema(() -> workspaceRepository.findAllByWorkspaceIdentifierIsNotNull()
                .stream()
                .map(Workspace::getWorkspaceIdentifier)
                .filter(id -> !id.isBlank())
                .toList());
    }
}
