#!/bin/bash

# Restore script for production data
# Usage: ./scripts/restore.sh <backup_directory>

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

# Check if backup directory is provided
if [ -z "$1" ]; then
    print_error "Please provide backup directory as argument"
    print_error "Usage: ./scripts/restore.sh <backup_directory>"
    exit 1
fi

BACKUP_DIR="$1"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup directory $BACKUP_DIR does not exist"
    exit 1
fi

print_warning "This will replace current production data with backup from $BACKUP_DIR"
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_status "Restore cancelled"
    exit 0
fi

# Stop services
print_status "Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Restore Redis data
if [ -f "$BACKUP_DIR/redis_dump.rdb" ]; then
    print_status "Restoring Redis data..."
    docker cp "$BACKUP_DIR/redis_dump.rdb" redis-prod:/data/dump.rdb
else
    print_warning "Redis backup not found, skipping..."
fi

# Restore n8n data
if [ -f "$BACKUP_DIR/n8n_data.tar.gz" ]; then
    print_status "Restoring n8n data..."
    docker run --rm -v my-chat-project_n8n_data:/data -v "$(pwd)/$BACKUP_DIR":/backup alpine tar xzf /backup/n8n_data.tar.gz -C /data
else
    print_warning "n8n backup not found, skipping..."
fi

# Restore configuration files
print_status "Restoring configuration files..."
if [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" .env
    print_warning ".env file restored. Please review configuration"
fi

# Start services
print_status "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    print_error "Some services are unhealthy after restore. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

print_status "Restore completed successfully! 🎉"
print_status "Services are running and healthy"
