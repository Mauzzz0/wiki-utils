#!/bin/bash

source ~/wiki/.env

# Variables
BACKUP_DIR=~/wiki/backups
CONTAINER_NAME=wiki-db-1

# Get current date and time for backup file
TIMESTAMP=$(date +"%F_%T")
BACKUP_FILE=$BACKUP_DIR/backup_$POSTGRES_DB_$TIMESTAMP.sql

# Run pg_dump inside the PostgreSQL container
docker exec -t $CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
