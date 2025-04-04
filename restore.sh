 #!/bin/bash

source '.env'

# Variables
BACKUP_FILE=$1
DB_NAME=$POSTGRES_DB
DB_USER=$POSTGRES_USER
DB_PASSWORD=$POSTGRES_PASSWORD
CONTAINER_NAME=wiki-db-1

# Restore the database
cat $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME

echo "Database restored from: $BACKUP_FILE"
