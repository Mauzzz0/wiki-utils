 #!/bin/bash

source '.env'

if [ -z "$1" ]; then
    echo "Ошибка: Не указан файл бекапа" >&2
    echo "Использование: $0 <backup_file>" >&2
    exit 1
fi

# Variables
BACKUP_FILE=$1
DB_PASSWORD=$POSTGRES_PASSWORD
CONTAINER_NAME=wiki-db-1

# Restore the database
cat $BACKUP_FILE | docker exec -i $CONTAINER_NAME psql -U $POSTGRES_USER -d $POSTGRES_DB

echo "Database restored from: $BACKUP_FILE"

