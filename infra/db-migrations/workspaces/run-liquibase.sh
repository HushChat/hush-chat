#!/bin/bash

# Ensure the logs directory exists
mkdir -p logs

# Find changelogs with the specified label
CHANGELOG_FILES=$(grep -rl '<label>exclusiveRun</label>' .)

# Check if we found any changelog with the label
if [[ -z "${CHANGELOG_FILES}" ]]; then
    echo "No changelog found with the specified label."
    exit 1
fi

# Loop through each changelog found and run Liquibase
for CHANGELOG_FILE in $CHANGELOG_FILES; do
    # Generate the log filename dynamically based on the current date and time only
    LOG_FILENAME="logs/db-migration-logs-$(date +'%Y-%m-%d-%H:%M:%S').log"

    # Run Liquibase and redirect output to the log file
    # --labels=exclusiveRun flag used to run selected (labeled as exclusiveRun) changes only, remove it if you want to run all change logs
    liquibase --changeLogFile=${CHANGELOG_FILE} --logLevel=DEBUG --labels=exclusiveRun update > ${LOG_FILENAME} 2>&1
done
