# Deployment Guide

This guide provides step-by-step instructions for deploying the chat application to production.

## Prerequisites

- Docker and Docker Compose installed
- Server with at least 2GB RAM and 10GB storage
- Domain name (optional, for SSL)
- SSL certificates (if using HTTPS)

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd my-chat-project
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Deploy

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## Detailed Deployment

### Environment Variables

Key environment variables to configure in `.env`:

```bash
# N8N Configuration
N8N_HOST=your-domain.com
WEBHOOK_URL=https://your-domain.com/webhook/chat-memory

# Redis Configuration (optional password)
REDIS_PASSWORD=your-secure-password

# Security
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
```

### SSL Configuration

For production with SSL:

1. Place SSL certificates in `ssl/` directory:
   - `ssl/cert.pem` - SSL certificate
   - `ssl/key.pem` - SSL private key

2. Update nginx configuration in `react-chat-app/nginx.conf`:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Production Docker Compose

Use `docker-compose.prod.yml` for production:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop services
docker-compose -f docker-compose.prod.yml down
```

## Service Management

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose -f docker-compose.prod.yml ps

# View health check logs
docker-compose -f docker-compose.prod.yml logs n8n
```

### Scaling

To scale individual services:

```bash
# Scale React app (behind load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale react-app=2
```

### Updates

To update the application:

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoring

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs

# View specific service logs
docker-compose -f docker-compose.prod.yml logs n8n
docker-compose -f docker-compose.prod.yml logs redis
docker-compose -f docker-compose.prod.yml logs react-app
```

### Resource Usage

```bash
# Check resource usage
docker stats

# Check disk usage
docker system df
```

## Backup and Recovery

### Data Backup

```bash
# Backup Redis data
docker exec redis-prod redis-cli BGSAVE
docker cp redis-prod:/data/dump.rdb ./backup/

# Backup n8n data
docker run --rm -v n8n_my-chat-project:/data -v $(pwd):/backup alpine tar czf /backup/n8n-backup.tar.gz -C /data .
```

### Data Recovery

```bash
# Restore Redis data
docker cp ./backup/dump.rdb redis-prod:/data/
docker restart redis-prod

# Restore n8n data
docker run --rm -v n8n_my-chat-project:/data -v $(pwd):/backup alpine tar xzf /backup/n8n-backup.tar.gz -C /data
```

## Security Considerations

### Network Security

1. **Firewall Configuration**:
   ```bash
   # Allow only necessary ports
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw allow 22/tcp
   ufw enable
   ```

2. **Redis Security**:
   - Set a strong Redis password in `.env`
   - Uncomment and configure `requirepass` in `redis.conf`

3. **N8N Security**:
   - Enable basic authentication if needed
   - Use environment variables for sensitive data

### SSL/TLS

1. **Let's Encrypt** (recommended):
   ```bash
   # Install certbot
   apt install certbot python3-certbot-nginx
   
   # Get certificate
   certbot --nginx -d your-domain.com
   ```

2. **Custom Certificates**:
   - Place certificates in `ssl/` directory
   - Update nginx configuration

## Troubleshooting

### Common Issues

1. **Services not starting**:
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Check resource usage
   docker stats
   ```

2. **N8N webhook issues**:
   - Verify `WEBHOOK_URL` environment variable
   - Check network connectivity between services

3. **Redis connection issues**:
   - Verify Redis is running: `docker exec redis-prod redis-cli ping`
   - Check password configuration

### Performance Optimization

1. **Memory Limits**:
   - Adjust `maxmemory` in `redis.conf`
   - Monitor Docker container memory usage

2. **Database Optimization**:
   - Regular Redis backups
   - Monitor Redis memory usage

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed (if using HTTPS)
- [ ] Firewall configured
- [ ] Backup strategy implemented
- [ ] Monitoring setup
- [ ] Log rotation configured
- [ ] Security updates planned
- [ ] Performance testing completed

## Support

For deployment issues:

1. Check logs: `docker-compose -f docker-compose.prod.yml logs`
2. Verify environment configuration
3. Check resource availability
4. Review security settings

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Check service health
   - Review logs for errors
   - Monitor resource usage

2. **Monthly**:
   - Update Docker images
   - Test backup/restore procedures
   - Review security settings

3. **Quarterly**:
   - Security audit
   - Performance review
   - Capacity planning
