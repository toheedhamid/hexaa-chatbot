# Production deployment script for Windows
# Usage: .\scripts\deploy.ps1

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "WARNING: .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please edit .env file with your configuration before continuing." -ForegroundColor Yellow
    exit 1
}

# Pull latest images
Write-Host "Pulling latest Docker images..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml pull

# Build and start services
Write-Host "Building and starting services..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be healthy
Write-Host "Waiting for services to be healthy..." -ForegroundColor Green
Start-Sleep -Seconds 30

# Check service health
Write-Host "Checking service health..." -ForegroundColor Green
$healthCheck = docker-compose -f docker-compose.prod.yml ps
if ($healthCheck -match "unhealthy") {
    Write-Host "ERROR: Some services are unhealthy. Check logs with: docker-compose -f docker-compose.prod.yml logs" -ForegroundColor Red
    exit 1
}

# Show service status
Write-Host "Service status:" -ForegroundColor Green
docker-compose -f docker-compose.prod.yml ps

Write-Host "Deployment completed successfully! 🎉" -ForegroundColor Green
Write-Host "Application is available at: http://localhost" -ForegroundColor Green
Write-Host "N8N is available at: http://localhost:5678" -ForegroundColor Green
Write-Host "WARNING: Don't forget to:" -ForegroundColor Yellow
Write-Host "1. Configure your domain name in .env" -ForegroundColor Yellow
Write-Host "2. Set up SSL certificates for production" -ForegroundColor Yellow
Write-Host "3. Configure backup strategy" -ForegroundColor Yellow
