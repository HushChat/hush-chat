<!-- Trigger build 11 -->
# Chat App Schema Management

We use an evolutionary DataBase maintenance practice based on an automated schema migration tool.

## Liquibase Based Schema Management Practice

- The schema for chat app is managed using the liquibase schema migration tool.
- We use YAML based schema migration. We track the schema changes for each release in a changelog.
  - Eg: The changes until MVP will be tracked in `db.changelog-0.2.yaml`
- Committing Database Changes

  - Each PR will have at most 1 change-set submitted with an appropriate author name.

## File Naming Convention
Use zero-padded versioning for proper alphanumeric sorting:
```
db.changelog-001.0.yaml  (version 1.0)
db.changelog-001.1.yaml  (version 1.1)
db.changelog-001.2.yaml  (version 1.2)
db.changelog-002.0.yaml  (version 2.0)
db.changelog-010.0.yaml  (version 10.0)
```


  ```yaml
  - changeSet:
      id: Adding new column and table for feature X <- add a unique identifier
      author: ishan <- add your name
      tag: release-1.1 <- mandatory to add this, this is unique for 1 changelog file, using for rollback
          # Use the change log file number as the main number and for each changeset increment a secondary number. 
          # For example, db-changelog-0.4 tags for each changeset would be 4.1, 4.2, and so on.
      changes:
        - createTable:
          columns:
            - column:
                constraints:
                  nullable: false
                  primaryKey: true
                  primaryKeyName: onboard_stage_pkey
                name: id
                type: BIGINT
            - column:
                constraints:
                  nullable: false
                name: created_at
                type: TIMESTAMP WITHOUT TIME ZONE
            - column:
                constraints:
                  nullable: false
                name: enabled
                type: BOOLEAN
            - column:
                name: name
                type: VARCHAR(255)
  ```

  - Install LIQUIBASE to your PC:

    > sudo snap install liquibase

  - The jar `postgresql-42.2.25.jar` should be in the location where the changelog is run which can be downloaded from

    > https://repo1.maven.org/maven2/org/postgresql/postgresql/42.2.25/

  - This command generates a change log from the current schema and adds it as a changelog file
    The command used was.

    > liquibase --driver=org.postgresql.Driver --changeLogFile=db.initial-details.yaml --classpath=postgresql-42.2.25.jar --url="jdbc:postgresql://localhost:5432/chat_system" --username=admin --password=admin --defaultSchemaName=test_1 --liquibaseSchemaName=test_1 --logLevel=debug generateChangeLog

  - To update the schema according to the yaml file. The command is,

    > liquibase --driver=org.postgresql.Driver --changeLogFile=db.changelog-root.yaml --classpath=postgresql-42.2.25.jar --url="jdbc:postgresql://localhost:5432/chat_system" --username=admin --password=admin --defaultSchemaName=test_1 --liquibaseSchemaName=test_1 --logLevel=debug update

    Here changing yaml file is `db.changelog-0.3.yaml`

  - Or you can run,

    > liquibase --labels=exclusiveRun --logLevel=DEBUG update

  - If you run without `--labels=exclusiveRun` flag liquibase will run all the changelogs, order will be db.changelog-root includes list

  - To update and log the change logs, run the bash command

    > chmod +x run-liquibase.sh

    > ./run-liquibase.sh

  - In the PR we will create a DB instance from trunk's liquibase, apply any liquibase changes from your PR, run the tests
  - and make sure everything is working

  - Example of a **Rollback** Command
    Suppose you have tagged a version of your database schema as "release-1.2", and you want to rollback to this state:
    
    > liquibase --driver=org.postgresql.Driver \
    --classpath=postgresql-42.2.25.jar \
    --changeLogFile=db.changelog-master.yaml \
    --url="jdbc:postgresql://localhost:5432/chat_system" \
    --username=admin \
    --password=admin \
    rollback release-1.2

### ... TBC ....
