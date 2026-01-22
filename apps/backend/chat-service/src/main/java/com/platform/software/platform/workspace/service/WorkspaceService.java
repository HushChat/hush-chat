package com.platform.software.platform.workspace.service;

import com.platform.software.config.cache.CacheNames;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.exception.MigrationException;
import com.platform.software.exception.SchemaCreationException;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.entity.WorkspaceStatus;
import com.platform.software.platform.workspace.repository.AllowedIpRepository;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserRole;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class WorkspaceService {
    Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;
    private final DatabaseSchemaService databaseSchemaService;
    private final AllowedIpRepository allowedIpRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, WorkspaceUserRepository workspaceUserRepository, DatabaseSchemaService databaseSchemaService, AllowedIpRepository allowedIpRepository) {
        this.workspaceRepository = workspaceRepository;
        this.workspaceUserRepository = workspaceUserRepository;
        this.databaseSchemaService = databaseSchemaService;
        this.allowedIpRepository = allowedIpRepository;
    }

    public void requestCreateWorkspace(WorkspaceUpsertDTO workspaceUpsertDTO, String loggedInUserEmail) {
        WorkspaceUtils.runInGlobalSchema(() -> {
            if (!workspaceUpsertDTO.getName().matches("^[a-zA-Z0-9_]+$")) {
                throw new CustomBadRequestException("Invalid schema name: " + workspaceUpsertDTO.getName());
            }

            if (workspaceRepository.existsByName(workspaceUpsertDTO.getName())) {
                logger.error("Workspace with schema {} already exists", workspaceUpsertDTO.getName());
                throw new CustomBadRequestException("Workspace with schema '" + workspaceUpsertDTO.getName() + "' already exists");
            }

            Workspace workspace = workspaceUpsertDTO.buildWorkspace();
            workspace.setStatus(WorkspaceStatus.PENDING);

            Workspace createdWorkspace = workspaceRepository.save(workspace);
            logger.info("Workspace creation request initialized for workspace ID: {} and schema: {}", createdWorkspace.getId(), createdWorkspace.getName());

            WorkspaceUserInviteDTO workspaceUserInviteDTO = new WorkspaceUserInviteDTO(loggedInUserEmail);
            WorkspaceUser newWorkspaceUser =
                    WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, createdWorkspace, "");
            newWorkspaceUser.setRole(WorkspaceUserRole.ADMIN);
            workspaceUserRepository.save(newWorkspaceUser);
        });
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
    private void createWorkspace(WorkspaceUpsertDTO workspaceUpsertDTO) {

        try {
            databaseSchemaService.createDatabaseSchema(workspaceUpsertDTO.getName());

            databaseSchemaService.applyDatabaseMigrations(workspaceUpsertDTO.getName());

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

    public void approveCreateWorkspaceRequest(Long workspaceId ) {

        WorkspaceUtils.runInGlobalSchema(() -> {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new CustomBadRequestException("Workspace not found!"));

            if (workspace.getStatus() != null && workspace.getStatus().equals(WorkspaceStatus.ACTIVE)) {
                throw new CustomBadRequestException("Workspace is already active!");
            }

            createWorkspace(new WorkspaceUpsertDTO(workspace.getName(), workspace.getDescription(), workspace.getImageUrl()));

            workspace.setStatus(WorkspaceStatus.ACTIVE);
            workspaceRepository.save(workspace);
            logger.info("Workspace with ID: {} has been approved and activated", workspaceId);
        });
    }

    /**
     * Get names of all available workspaces
     *
     * @return List<String>
     */
    public List<String> getAllWorkspaces(){
        return WorkspaceUtils.runInGlobalSchema(() -> workspaceRepository.findAllByWorkspaceIdentifierIsNotNull()
                .stream()
                .filter(workspace -> workspace.getStatus() != WorkspaceStatus.PENDING)
                .map(Workspace::getWorkspaceIdentifier)
                .filter(id -> !id.isBlank())
                .toList()
        );
    }

    /**
     * Get allowed IP addresses for a given workspace
     *
     * @param workspaceIdentifier the identifier of the workspace
     * @return Set<String> set of allowed IP addresses
     */
    @Cacheable(value = CacheNames.WORKSPACE_ALLOWED_IPS, keyGenerator = CacheNames.WORKSPACE_AWARE_KEY_GENERATOR)
    public Set<String> getAllowedIps(String workspaceIdentifier) {
        return WorkspaceUtils.runInGlobalSchema(() -> allowedIpRepository.findAllowedIpAddresses(workspaceIdentifier));
    }
}
