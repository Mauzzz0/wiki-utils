 #!/bin/bash

# Variables
BACKUP_FILE=$1
DB_NAME=wiki
DB_USER=wikijs
DB_PASSWORD=wikijsrocks
CONTAINER_NAME=wiki-compose-db-1

# Restore the database
cat $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME

echo "Database restored from: $BACKUP_FILE"
