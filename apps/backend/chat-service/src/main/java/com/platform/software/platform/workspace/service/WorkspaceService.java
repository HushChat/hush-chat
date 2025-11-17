package com.platform.software.platform.workspace.service;

import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.repository.WorkspaceUserRepository;
import com.platform.software.utils.WorkspaceUtils;
import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.command.CommandScope;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CommandExecutionException;
import liquibase.exception.LiquibaseException;
import liquibase.resource.DirectoryResourceAccessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;

import java.util.List;

@Service
public class WorkspaceService {
    Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    private final DataSource dataSource;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;

    @Value("${liquibase.changelog.path}")
    private String changelogPath;

    public WorkspaceService(DataSource dataSource, WorkspaceRepository workspaceRepository, WorkspaceUserRepository workspaceUserRepository) {
        this.dataSource = dataSource;
        this.workspaceRepository = workspaceRepository;
        this.workspaceUserRepository = workspaceUserRepository;
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

        if (workspaceRepository.existsByName(workspaceUpsertDTO.getName())) {
            logger.error("Workspace with schema {} already exists", workspaceUpsertDTO.getName());
            throw new CustomBadRequestException("Workspace with schema '" + workspaceUpsertDTO.getName() + "' already exists");
        }

        try {
            createDatabaseSchema(workspaceUpsertDTO.getName());

            applyDatabaseMigrations(workspaceUpsertDTO.getName());

            Workspace workspace = workspaceUpsertDTO.buildWorkspace();

            WorkspaceUtils.runInGlobalSchema(() -> {
                Workspace createdWorkspace = workspaceRepository.save(workspace);
                logger.info("Successfully created workspace with ID: {} and schema: {}", createdWorkspace.getId(), createdWorkspace.getName());

                WorkspaceUserInviteDTO workspaceUserInviteDTO = new WorkspaceUserInviteDTO(loggedInUserEmail);
                WorkspaceUser newWorkspaceUser =
                        WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, createdWorkspace, "");
                workspaceUserRepository.save(newWorkspaceUser);
            });

        } catch (Exception e) {
            logger.error("Failed to create workspace with schema: {}", workspaceUpsertDTO.getName(), e);
            throw new CustomInternalServerErrorException("Failed to create workspace" );
        }
    }

    private void createDatabaseSchema(String schemaName) throws CommandExecutionException {
        if (!schemaName.matches("^[a-zA-Z0-9_]+$")) {
            throw new CustomBadRequestException("Invalid schema name");
        }

        try {
            CommandScope command = new CommandScope("createSchema");
            command.addArgumentValue("schemaName", schemaName);
            command.addArgumentValue("ifNotExists", true);
            command.execute();

            logger.info("Schema '{}' created successfully.", schemaName);
        } catch (CommandExecutionException e) {
            logger.error("Liquibase failed to create schema '{}': {}", schemaName, e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error creating schema '{}'", schemaName, e);
            throw new CommandExecutionException("Unexpected error creating schema: " + schemaName, e);
        }
    }

    private void applyDatabaseMigrations(String schemaName) throws SQLException, FileNotFoundException {
        try (Connection connection = dataSource.getConnection()) {
            connection.setSchema(schemaName);

            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));

            database.setDefaultSchemaName(schemaName);
            database.setLiquibaseSchemaName(schemaName);

            Path changelogPath = Paths.get(this.changelogPath);
            if (!Files.exists(changelogPath)) {
                throw new FileNotFoundException("Changelog path not found: " + changelogPath);
            }

            Path runtimeChangelogFile = changelogPath.resolve("db.changelog-runtime.yaml");
            if (!Files.exists(runtimeChangelogFile)) {
                throw new FileNotFoundException("Runtime changelog file not found: " + runtimeChangelogFile);
            }

            DirectoryResourceAccessor resourceAccessor = new DirectoryResourceAccessor(changelogPath);

            Liquibase liquibase = new Liquibase(
                    "db.changelog-runtime.yaml",
                    resourceAccessor,
                    database
            );

            logger.info("Applying initial-setup migrations for schema: {}", schemaName);
            liquibase.update(new Contexts("initial-setup"), new LabelExpression());

            logger.info("Applying regular-updates migrations for schema: {}", schemaName);
            liquibase.update(new Contexts("regular-updates"), new LabelExpression());

        } catch (LiquibaseException | SQLException e) {
            logger.error("Failed to apply database migrations for schema: {}", schemaName, e);
            throw new SQLException("Failed to apply migrations", e);
        }
    }
    
    public List<String> getAllWorkspaces(){
        return WorkspaceUtils.runInGlobalSchema(() -> workspaceRepository.findAllByWorkspaceIdentifierIsNotNull()
                .stream()
                .map(Workspace::getWorkspaceIdentifier)
                .filter(id -> !id.isBlank())
                .toList());
    }
}
