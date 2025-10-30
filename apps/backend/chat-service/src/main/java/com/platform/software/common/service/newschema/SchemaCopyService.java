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

package com.platform.software.common.service.newschema;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SchemaCopyService {

    private static final Logger logger = LoggerFactory.getLogger(SchemaCopyService.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional
    public void copySchemaComplete(String sourceSchema, String targetSchema) {
        try {
            logger.info("Starting schema copy from {} to {}", sourceSchema, targetSchema);

            // Validate schemas
            validateSchemaName(sourceSchema);
            validateSchemaName(targetSchema);

            // Check if source schema exists
            if (!schemaExists(sourceSchema)) {
                throw new IllegalArgumentException("Source schema does not exist: " + sourceSchema);
            }

            // Check if target schema already exists
            if (schemaExists(targetSchema)) {
                throw new IllegalArgumentException("Target schema already exists: " + targetSchema);
            }

            // Create target schema
            jdbcTemplate.execute("CREATE SCHEMA IF NOT EXISTS " + targetSchema);

            // Copy tables with all attributes (excluding foreign keys initially)
            copyTables(sourceSchema, targetSchema);

            // Copy sequences
            copySequences(sourceSchema, targetSchema);

            // Copy custom types (if any)
            copyTypes(sourceSchema, targetSchema);

            // Copy foreign keys (after all tables are created)
            copyForeignKeys(sourceSchema, targetSchema);

            logger.info("Successfully copied schema from {} to {}", sourceSchema, targetSchema);

        } catch (Exception e) {
            logger.error("Failed to copy schema from {} to {}", sourceSchema, targetSchema, e);
            // Cleanup on failure
            try {
                dropSchema(targetSchema);
            } catch (Exception cleanupException) {
                logger.error("Failed to cleanup target schema {} after copy failure", targetSchema, cleanupException);
            }
            throw e;
        }
    }

    /**
     * Copies foreign key constraints from source schema to target schema
     * @param sourceSchema the source schema name
     * @param targetSchema the target schema name
     */
    private void copyForeignKeys(String sourceSchema, String targetSchema) {
        logger.info("Copying foreign keys from {} to {}", sourceSchema, targetSchema);

        String getForeignKeysQuery = """
            SELECT 
                tc.constraint_name,
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name,
                rc.update_rule,
                rc.delete_rule
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON tc.constraint_name = rc.constraint_name
                  AND tc.table_schema = rc.constraint_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = ?
            ORDER BY tc.table_name, tc.constraint_name
            """;

        List<Map<String, Object>> foreignKeys = jdbcTemplate.queryForList(getForeignKeysQuery, sourceSchema);

        for (Map<String, Object> fk : foreignKeys) {
            try {
                String constraintName = (String) fk.get("constraint_name");
                String tableName = (String) fk.get("table_name");
                String columnName = (String) fk.get("column_name");
                String foreignTableName = (String) fk.get("foreign_table_name");
                String foreignColumnName = (String) fk.get("foreign_column_name");
                String updateRule = (String) fk.get("update_rule");
                String deleteRule = (String) fk.get("delete_rule");

                // Build the ALTER TABLE statement for foreign key
                StringBuilder fkSql = new StringBuilder();
                fkSql.append(String.format("ALTER TABLE %s.%s ", targetSchema, tableName));
                fkSql.append(String.format("ADD CONSTRAINT %s ", constraintName));
                fkSql.append(String.format("FOREIGN KEY (%s) ", columnName));
                fkSql.append(String.format("REFERENCES %s.%s (%s)", targetSchema, foreignTableName, foreignColumnName));

                // Add ON UPDATE and ON DELETE rules if they're not the default
                if (!"NO ACTION".equals(updateRule)) {
                    fkSql.append(" ON UPDATE ").append(updateRule.replace("_", " "));
                }
                if (!"NO ACTION".equals(deleteRule)) {
                    fkSql.append(" ON DELETE ").append(deleteRule.replace("_", " "));
                }

                jdbcTemplate.execute(fkSql.toString());
                logger.debug("Copied foreign key: {}.{} -> {}", targetSchema, tableName, constraintName);

            } catch (Exception e) {
                logger.error("Failed to copy foreign key: {}", fk.get("constraint_name"), e);
                throw e;
            }
        }

        logger.info("Successfully copied {} foreign keys", foreignKeys.size());
    }

    /**
     * Copies composite foreign key constraints (multiple columns)
     * @param sourceSchema the source schema name
     * @param targetSchema the target schema name
     */
    private void copyCompositeForeignKeys(String sourceSchema, String targetSchema) {
        logger.info("Copying composite foreign keys from {} to {}", sourceSchema, targetSchema);

        String getCompositeForeignKeysQuery = """
            SELECT 
                tc.constraint_name,
                tc.table_name,
                array_agg(kcu.column_name ORDER BY kcu.ordinal_position) AS column_names,
                ccu.table_name AS foreign_table_name,
                array_agg(ccu.column_name ORDER BY kcu.ordinal_position) AS foreign_column_names,
                rc.update_rule,
                rc.delete_rule
            FROM 
                information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                  AND tc.table_schema = kcu.table_schema
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                  AND ccu.table_schema = tc.table_schema
                JOIN information_schema.referential_constraints AS rc
                  ON tc.constraint_name = rc.constraint_name
                  AND tc.table_schema = rc.constraint_schema
            WHERE 
                tc.constraint_type = 'FOREIGN KEY' 
                AND tc.table_schema = ?
            GROUP BY 
                tc.constraint_name, tc.table_name, ccu.table_name, rc.update_rule, rc.delete_rule
            HAVING COUNT(*) > 1
            ORDER BY tc.table_name, tc.constraint_name
            """;

        List<Map<String, Object>> compositeForeignKeys = jdbcTemplate.queryForList(getCompositeForeignKeysQuery, sourceSchema);

        for (Map<String, Object> fk : compositeForeignKeys) {
            try {
                String constraintName = (String) fk.get("constraint_name");
                String tableName = (String) fk.get("table_name");
                String[] columnNames = (String[]) ((java.sql.Array) fk.get("column_names")).getArray();
                String foreignTableName = (String) fk.get("foreign_table_name");
                String[] foreignColumnNames = (String[]) ((java.sql.Array) fk.get("foreign_column_names")).getArray();
                String updateRule = (String) fk.get("update_rule");
                String deleteRule = (String) fk.get("delete_rule");

                // Build the ALTER TABLE statement for composite foreign key
                StringBuilder fkSql = new StringBuilder();
                fkSql.append(String.format("ALTER TABLE %s.%s ", targetSchema, tableName));
                fkSql.append(String.format("ADD CONSTRAINT %s ", constraintName));
                fkSql.append(String.format("FOREIGN KEY (%s) ", String.join(", ", columnNames)));
                fkSql.append(String.format("REFERENCES %s.%s (%s)",
                    targetSchema, foreignTableName, String.join(", ", foreignColumnNames)));

                // Add ON UPDATE and ON DELETE rules if they're not the default
                if (!"NO ACTION".equals(updateRule)) {
                    fkSql.append(" ON UPDATE ").append(updateRule.replace("_", " "));
                }
                if (!"NO ACTION".equals(deleteRule)) {
                    fkSql.append(" ON DELETE ").append(deleteRule.replace("_", " "));
                }

                jdbcTemplate.execute(fkSql.toString());
                logger.debug("Copied composite foreign key: {}.{} -> {}", targetSchema, tableName, constraintName);

            } catch (Exception e) {
                logger.error("Failed to copy composite foreign key: {}", fk.get("constraint_name"), e);
//                throw e;
            }
        }

        logger.info("Successfully copied {} composite foreign keys", compositeForeignKeys.size());
    }

    /**
     * Drops a schema and all its contents
     * @param schemaName the schema to drop
     */
    public void dropSchema(String schemaName) {
        if (schemaName == null || schemaName.trim().isEmpty()) {
            throw new IllegalArgumentException("Schema name cannot be null or empty");
        }

        validateSchemaName(schemaName);

        try {
            logger.info("Dropping schema: {}", schemaName);

            if (!schemaExists(schemaName)) {
                logger.warn("Schema {} does not exist, nothing to drop", schemaName);
                return;
            }

            // Drop schema with CASCADE to remove all dependent objects
            String dropSchemaSql = String.format("DROP SCHEMA IF EXISTS %s CASCADE", schemaName);
            jdbcTemplate.execute(dropSchemaSql);

            logger.info("Successfully dropped schema: {}", schemaName);

        } catch (DataAccessException e) {
            logger.error("Failed to drop schema: {}", schemaName, e);
            throw new RuntimeException("Failed to drop schema: " + schemaName, e);
        }
    }

    /**
     * Drops a schema only if it's empty
     * @param schemaName the schema to drop
     */
    public void dropSchemaIfEmpty(String schemaName) {
        if (schemaName == null || schemaName.trim().isEmpty()) {
            throw new IllegalArgumentException("Schema name cannot be null or empty");
        }

        validateSchemaName(schemaName);

        try {
            logger.info("Attempting to drop empty schema: {}", schemaName);

            if (!schemaExists(schemaName)) {
                logger.warn("Schema {} does not exist, nothing to drop", schemaName);
                return;
            }

            // Check if schema is empty
            if (!isSchemaEmpty(schemaName)) {
                throw new IllegalStateException("Cannot drop schema " + schemaName + " because it contains objects");
            }

            // Drop schema without CASCADE since it should be empty
            String dropSchemaSql = String.format("DROP SCHEMA %s", schemaName);
            jdbcTemplate.execute(dropSchemaSql);

            logger.info("Successfully dropped empty schema: {}", schemaName);

        } catch (DataAccessException e) {
            logger.error("Failed to drop empty schema: {}", schemaName, e);
            throw new RuntimeException("Failed to drop empty schema: " + schemaName, e);
        }
    }

    /**
     * Checks if a schema exists
     * @param schemaName the schema name to check
     * @return true if schema exists, false otherwise
     */
    public boolean schemaExists(String schemaName) {
        String checkSchemaQuery = """
            SELECT COUNT(*) 
            FROM information_schema.schemata 
            WHERE schema_name = ?
            """;

        Integer count = jdbcTemplate.queryForObject(checkSchemaQuery, Integer.class, schemaName);
        return count != null && count > 0;
    }

    /**
     * Checks if a schema is empty (contains no tables, sequences, types, etc.)
     * @param schemaName the schema name to check
     * @return true if schema is empty, false otherwise
     */
    public boolean isSchemaEmpty(String schemaName) {
        // Check for tables
        String checkTablesQuery = """
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = ?
            """;

        Integer tableCount = jdbcTemplate.queryForObject(checkTablesQuery, Integer.class, schemaName);
        if (tableCount != null && tableCount > 0) {
            return false;
        }

        // Check for sequences
        String checkSequencesQuery = """
            SELECT COUNT(*) 
            FROM information_schema.sequences 
            WHERE sequence_schema = ?
            """;

        Integer sequenceCount = jdbcTemplate.queryForObject(checkSequencesQuery, Integer.class, schemaName);
        if (sequenceCount != null && sequenceCount > 0) {
            return false;
        }

        // Check for custom types
        String checkTypesQuery = """
            SELECT COUNT(*) 
            FROM pg_type t 
            JOIN pg_namespace n ON t.typnamespace = n.oid 
            WHERE n.nspname = ?
            """;

        Integer typeCount = jdbcTemplate.queryForObject(checkTypesQuery, Integer.class, schemaName);
        return typeCount == null || typeCount == 0;
    }

    /**
     * Lists all schemas in the database
     * @return list of schema names
     */
    public List<String> listSchemas() {
        String listSchemasQuery = """
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name
            """;

        return jdbcTemplate.queryForList(listSchemasQuery, String.class);
    }

    /**
     * Validates schema name to prevent SQL injection
     * @param schemaName the schema name to validate
     */
    private void validateSchemaName(String schemaName) {
        if (schemaName == null || schemaName.trim().isEmpty()) {
            throw new IllegalArgumentException("Schema name cannot be null or empty");
        }

        // Allow only alphanumeric characters, underscores, and dots
        if (!schemaName.matches("^[a-zA-Z0-9_\\.]+$")) {
            throw new IllegalArgumentException("Invalid schema name format: " + schemaName);
        }

        // Prevent reserved schema names
        if (schemaName.equalsIgnoreCase("information_schema") ||
            schemaName.equalsIgnoreCase("pg_catalog") ||
            schemaName.equalsIgnoreCase("pg_toast")) {
            throw new IllegalArgumentException("Cannot use reserved schema name: " + schemaName);
        }
    }

    private void copyTables(String sourceSchema, String targetSchema) {
        String getTablesQuery = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_type = 'BASE TABLE'
            ORDER BY table_name
            """;

        List<String> tables = jdbcTemplate.queryForList(getTablesQuery, String.class, sourceSchema);

        for (String table : tables) {
            try {
                // Copy table structure including indexes, constraints, etc. (but not foreign keys)
                String copyTableSql = String.format(
                    "CREATE TABLE %s.%s (LIKE %s.%s INCLUDING ALL)",
                    targetSchema, table, sourceSchema, table
                );
                jdbcTemplate.execute(copyTableSql);
                logger.debug("Copied table: {}.{}", targetSchema, table);
            } catch (Exception e) {
                logger.error("Failed to copy table {}.{}", sourceSchema, table, e);
                throw e;
            }
        }
    }

    private void copySequences(String sourceSchema, String targetSchema) {
        String getSequencesQuery = """
            SELECT sequence_name 
            FROM information_schema.sequences 
            WHERE sequence_schema = ?
            """;

        List<String> sequences = jdbcTemplate.queryForList(getSequencesQuery, String.class, sourceSchema);

        for (String sequence : sequences) {
            try {
                String copySequenceSql = String.format(
                    "CREATE SEQUENCE %s.%s AS BIGINT",
                    targetSchema, sequence
                );
                jdbcTemplate.execute(copySequenceSql);
                logger.debug("Copied sequence: {}.{}", targetSchema, sequence);
            } catch (Exception e) {
                logger.error("Failed to copy sequence {}.{}", sourceSchema, sequence, e);
                throw e;
            }
        }
    }

    private void copyTypes(String sourceSchema, String targetSchema) {
        String getTypesQuery = """
            SELECT typname 
            FROM pg_type t 
            JOIN pg_namespace n ON t.typnamespace = n.oid 
            WHERE n.nspname = ? AND t.typtype = 'e'
            """;

        List<String> types = jdbcTemplate.queryForList(getTypesQuery, String.class, sourceSchema);

        for (String type : types) {
            try {
                // Get enum values and recreate
                String getEnumValues = """
                    SELECT enumlabel 
                    FROM pg_enum e 
                    JOIN pg_type t ON e.enumtypid = t.oid 
                    JOIN pg_namespace n ON t.typnamespace = n.oid 
                    WHERE n.nspname = ? AND t.typname = ?
                    ORDER BY enumsortorder
                    """;

                List<String> enumValues = jdbcTemplate.queryForList(getEnumValues, String.class, sourceSchema, type);

                if (!enumValues.isEmpty()) {
                    String enumValuesList = enumValues.stream()
                        .map(v -> "'" + v + "'")
                        .collect(Collectors.joining(", "));

                    String createEnumSql = String.format(
                        "CREATE TYPE %s.%s AS ENUM (%s)",
                        targetSchema, type, enumValuesList
                    );
                    jdbcTemplate.execute(createEnumSql);
                    logger.debug("Copied type: {}.{}", targetSchema, type);
                }
            } catch (Exception e) {
                logger.error("Failed to copy type {}.{}", sourceSchema, type, e);
                throw e;
            }
        }
    }
}