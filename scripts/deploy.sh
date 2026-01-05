#!/bin/bash

# Production deployment script
# Usage: ./scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before continuing."
    exit 1
fi

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build and start services
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 30

# Check service health
print_status "Checking service health..."
if docker-compose -f docker-compose.prod.yml ps | grep -q "unhealthy"; then
    print_error "Some services are unhealthy. Check logs with: docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi

# Show service status
print_status "Service status:"
docker-compose -f docker-compose.prod.yml ps

print_status "Deployment completed successfully! 🎉"
print_status "Application is available at: http://localhost"
print_status "N8N is available at: http://localhost:5678"
print_warning "Don't forget to:"
print_warning "1. Configure your domain name in .env"
print_warning "2. Set up SSL certificates for production"
print_warning "3. Configure backup strategy"
