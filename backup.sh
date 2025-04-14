#!/bin/bash

cd ~/wiki/wiki-utils
source .env

BACKUP_DIR=~/wiki/wiki-utils/backups
TIMESTAMP=$(date +"%F_%T")
BACKUP_FILE=$BACKUP_DIR/backup_$POSTGRES_DB_$TIMESTAMP.sql

docker exec -t $POSTGRES_CONTAINER_NAME pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE

npm run backup:notify

echo "Backup completed: $BACKUP_FILE"
