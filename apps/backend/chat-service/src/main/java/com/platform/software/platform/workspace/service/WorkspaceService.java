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
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.LiquibaseException;
import liquibase.resource.DirectoryResourceAccessor;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspace.repository.WorkspaceRepository;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.utils.ValidationUtils;
import com.platform.software.utils.WorkspaceUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import java.util.List;

@Service
public class WorkspaceService {
    Logger logger = LoggerFactory.getLogger(WorkspaceService.class);

    private final DataSource dataSource;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceUserRepository workspaceUserRepository;

    private static final String CHANGELOG_PATH = "/app/db-migrations";

    public WorkspaceService(DataSource dataSource, WorkspaceRepository workspaceRepository, WorkspaceUserRepository workspaceUserRepository) {
        this.dataSource = dataSource;
        this.workspaceRepository = workspaceRepository;
        this.workspaceUserRepository = workspaceUserRepository;
    }

    @Transactional
    public void createWorkspace(WorkspaceUpsertDTO workspaceUpsertDTO, String loggedInUserEmail) {

        //TODO: Add loggedInUserEmail validation

        if (workspaceRepository.existsByName(workspaceUpsertDTO.getName())) {
            logger.error("tenant with schema {} already exists", workspaceUpsertDTO.getName());
            throw new CustomBadRequestException("Tenant with schema '" + workspaceUpsertDTO.getName() + "' already exists");
        }

        try {
            createDatabaseSchema(workspaceUpsertDTO.getName());

            applyDatabaseMigrations(workspaceUpsertDTO.getName());

            Workspace workspace = workspaceUpsertDTO.buildWorkspace();

            WorkspaceUtils.runInGlobalSchema(() -> {
                Workspace createdWorkspace = workspaceRepository.save(workspace);
                logger.info("successfully created workspace with ID: {} and schema: {}", createdWorkspace.getId(), createdWorkspace.getName());

                WorkspaceUserInviteDTO workspaceUserInviteDTO = new WorkspaceUserInviteDTO(loggedInUserEmail);
                WorkspaceUser newWorkspaceUser =
                        WorkspaceUserInviteDTO.createPendingInvite(workspaceUserInviteDTO, createdWorkspace, "");
                workspaceUserRepository.save(newWorkspaceUser);
            });

        } catch (Exception e) {
            logger.error("failed to create workspace with schema: {}", workspaceUpsertDTO.getName(), e);
            throw new CustomInternalServerErrorException("Failed to create tenant" );
        }
    }

    private void createDatabaseSchema(String schemaName) throws SQLException {

        String createSchemaSql = String.format("CREATE SCHEMA IF NOT EXISTS \"%s\"", schemaName);

        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {

            statement.execute(createSchemaSql);
            logger.info("Schema '{}' created successfully.", schemaName);
        } catch (SQLException e) {
            logger.error("Failed to create database schema: {}", schemaName, e);
            throw new SQLException("Failed to create schema");
        }
    }

    private void applyDatabaseMigrations(String schemaName) throws SQLException, FileNotFoundException {
        try (Connection connection = dataSource.getConnection()) {
            connection.setSchema(schemaName);

            Database database = DatabaseFactory.getInstance()
                    .findCorrectDatabaseImplementation(new JdbcConnection(connection));

            database.setDefaultSchemaName(schemaName);
            database.setLiquibaseSchemaName(schemaName);

            Path changelogPath = Paths.get(CHANGELOG_PATH);
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
