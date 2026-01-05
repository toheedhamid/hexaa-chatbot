#!/bin/bash

# Backup script for production data
# Usage: ./scripts/backup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory with timestamp
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

print_status "Starting backup to $BACKUP_DIR..."

# Backup Redis data
print_status "Backing up Redis data..."
docker exec redis-prod redis-cli BGSAVE
sleep 5
docker cp redis-prod:/data/dump.rdb "$BACKUP_DIR/redis_dump.rdb"

# Backup n8n data
print_status "Backing up n8n data..."
docker run --rm -v my-chat-project_n8n_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/n8n_data.tar.gz -C /data .

# Backup configuration files
print_status "Backing up configuration files..."
cp .env "$BACKUP_DIR/"
cp docker-compose.prod.yml "$BACKUP_DIR/"
cp redis.conf "$BACKUP_DIR/"

# Create backup info file
cat > "$BACKUP_DIR/backup_info.txt" << EOF
Backup created: $(date)
Docker Compose version: $(docker-compose --version)
Docker version: $(docker --version)
Services running: $(docker-compose -f docker-compose.prod.yml ps --services | tr '\n' ' ')
EOF

print_status "Backup completed successfully!"
print_status "Backup location: $BACKUP_DIR"
print_status "Backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"

# Cleanup old backups (keep last 7 days)
print_status "Cleaning up old backups..."
find ./backups -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

print_status "Backup process completed! 🎉"
