package com.platform.software.platform.workspace.service;

import com.platform.software.exception.MigrationException;
import com.platform.software.exception.SchemaCreationException;
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

@Service
public class DatabaseSchemaService {

    Logger logger = LoggerFactory.getLogger(DatabaseSchemaService.class);

    @Value("${liquibase.changelog.path}")
    private String changelogPath;

    private final DataSource dataSource;

    public DatabaseSchemaService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void createDatabaseSchema(String schemaName) throws SchemaCreationException {
        try {
            CommandScope command = new CommandScope("createSchema");
            command.addArgumentValue("schemaName", schemaName);
            command.addArgumentValue("ifNotExists", true);
            command.execute();

            logger.info("Schema '{}' created successfully.", schemaName);
        } catch (CommandExecutionException e) {
            throw new SchemaCreationException("Liquibase failed to create schema: " + schemaName, e);
        } catch (Exception e) {
            throw new SchemaCreationException("Unexpected error creating schema: " + schemaName, e);
        }
    }

    public void applyDatabaseMigrations(String schemaName) throws MigrationException, FileNotFoundException {
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
            throw new MigrationException("Failed to apply migrations", e);
        }
    }
}
