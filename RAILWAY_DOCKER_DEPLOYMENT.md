# Railway Docker Deployment for n8n

## Recommended: Use Official n8n Docker Image

The official n8n Docker image is the most reliable way to deploy n8n on Railway. It avoids npm installation issues and includes all required dependencies.

## Step 1: Create Dockerfile

The `Dockerfile` is already created in the project root:

```dockerfile
FROM n8nio/n8n:latest
WORKDIR /data
EXPOSE 5678
```

## Step 2: Railway Configuration

### Option A: Use Dockerfile (Recommended)

Railway will automatically detect the `Dockerfile` and use it for deployment.

1. **Delete or rename** `package.json` in root (if you want to force Docker build)
   - Or Railway will auto-detect Dockerfile and use it

2. **Railway Settings**:
   - Railway will automatically detect Dockerfile
   - No need for `railway.json` or `nixpacks.toml` when using Dockerfile
   - Railway will build and deploy using Docker

### Option B: Keep npm Installation (Alternative)

If you prefer npm installation, use the updated `nixpacks.toml` configuration.

## Step 3: Set Environment Variables

Add these **CRITICAL** variables first in Railway:

```bash
# CRITICAL: Disable problematic features (ADD THESE FIRST!)
N8N_COMMUNITY_PACKAGES_ENABLED=false
N8N_DIAGNOSTICS_ENABLED=false
NODE_ENV=production
N8N_LOG_LEVEL=info

# Basic Configuration
N8N_PROTOCOL=https
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password
N8N_ENCRYPTION_KEY=your-32-char-key
WEBHOOK_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/
N8N_EDITOR_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/

# Redis (if using)
QUEUE_BULL_REDIS_HOST=your-redis-host
QUEUE_BULL_REDIS_PASSWORD=your-redis-password
EXECUTIONS_MODE=queue

# OpenAI
N8N_OPENAI_API_KEY=sk-proj-your-key

# Gmail SMTP
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=toheedhamid9@gmail.com
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER=toheedhamid9@gmail.com
N8N_SMTP_SSL=false
```

## Step 4: Deploy

1. Push to GitHub (Dockerfile is already committed)
2. Railway will automatically:
   - Detect Dockerfile
   - Build Docker image
   - Deploy n8n

## Advantages of Docker Approach

✅ **No npm installation issues**
✅ **All dependencies pre-installed**
✅ **Tested and maintained by n8n team**
✅ **Faster builds** (uses pre-built image)
✅ **More reliable** (official image)

## Troubleshooting

### Issue: Railway not using Dockerfile

**Solution**:
- Check Railway project settings
- Ensure Dockerfile is in project root
- Railway should auto-detect it
- If not, you can specify in Railway settings

### Issue: Still getting module errors

**Solution**:
- Verify `N8N_COMMUNITY_PACKAGES_ENABLED=false` is set
- Check environment variables are set correctly
- Review Railway build logs

### Issue: Port conflicts

**Solution**:
- Ensure `N8N_PORT=5678` matches Railway's port
- Railway will assign a port automatically
- n8n will use the PORT environment variable if set

## Migration from npm to Docker

If you're currently using npm installation:

1. **Add Dockerfile** (already done)
2. **Set environment variables** (especially `N8N_COMMUNITY_PACKAGES_ENABLED=false`)
3. **Redeploy** - Railway will use Dockerfile automatically
4. **Remove root package.json** (optional, if you want to force Docker)

## Verification

After deployment:

```bash
# Health check
curl https://your-railway-app.railway.app/healthz

# Should return: {"status":"ok"}
```

## Summary

✅ **Dockerfile created** - Uses official n8n image
✅ **nixpacks.toml updated** - Alternative npm-based config
✅ **Environment variables documented** - Critical variables listed first
✅ **Ready to deploy** - Railway will auto-detect Dockerfile

The Docker approach is recommended and will resolve the community packages module error.
