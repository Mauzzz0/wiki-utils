 #!/bin/bash

# Variables
BACKUP_DIR=./backups
DB_NAME=wiki
DB_USER=wikijs
DB_PASSWORD=wikijsrocks
CONTAINER_NAME=wiki-db-1

# Get current date and time for backup file
TIMESTAMP=$(date +"%F_%T")
BACKUP_FILE=$BACKUP_DIR/backup_$DB_NAME_$TIMESTAMP.sql

# Run pg_dump inside the PostgreSQL container
docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
