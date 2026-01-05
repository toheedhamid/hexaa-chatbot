# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying your chat application to Vercel.

## Prerequisites

- Vercel account (free tier is sufficient)
- GitHub, GitLab, or Bitbucket account
- Redis service (Upstash Redis recommended for Vercel)
- Node.js 18+ installed locally

## Quick Start

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
vercel --prod
```

## Detailed Deployment

### Step 1: Set Up Redis

**Option A: Upstash Redis (Recommended)**
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Get the connection details from the dashboard
4. Copy the REST URL and password

**Option B: Redis Cloud**
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Set up a Redis database
4. Get connection details

### Step 2: Configure Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:

```bash
# Required
REDIS_URL=redis://default:password@host:port
REDIS_PASSWORD=your-redis-password

# Optional
EMBEDDING_API_URL=https://your-embedding-service.com/api
EMBEDDING_API_KEY=your-embedding-api-key
NEXT_PUBLIC_APP_NAME=Chat Application
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api
```

### Step 3: Update Configuration Files

#### vercel.json
The `vercel.json` file is already configured with:
- Build settings for React app
- API routes configuration
- Security headers
- Caching rules

#### API Routes
- `/api/chat-memory` - Main chat functionality
- `/api/status` - Health check endpoint

### Step 4: Deploy from Git

**Option A: Connect Git Repository**
1. Push your code to GitHub/GitLab/Bitbucket
2. In Vercel dashboard, click "New Project"
3. Import your repository
4. Vercel will auto-detect settings and deploy

**Option B: Deploy from CLI**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "react-chat-app/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/react-chat-app/index.html"
    }
  ]
}
```

### Environment Variables

Copy variables from `.env.vercel.example` to your Vercel project settings.

## API Endpoints

### POST /api/chat-memory
Handles chat functionality with three actions:

**Chat Action:**
```json
{
  "message": "Hello, how are you?",
  "conversationId": "conv_123456",
  "action": "chat"
}
```

**Get History:**
```json
{
  "conversationId": "conv_123456",
  "action": "get"
}
```

**Clear History:**
```json
{
  "conversationId": "conv_123456",
  "action": "clear"
}
```

### GET /api/status
Returns service status and health information.

## Testing Locally

### Install Dependencies
```bash
npm install
cd react-chat-app && npm install
```

### Run Local Development
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Run local development server
vercel dev
```

The app will be available at `http://localhost:3000`.

## Monitoring and Debugging

### Vercel Logs
1. Go to your Vercel dashboard
2. Select your project
3. Click on the "Logs" tab
4. Filter by function or time

### Redis Monitoring
- Upstash: Use the Upstash console
- Redis Cloud: Use Redis Insight

### Common Issues

**CORS Errors:**
- Ensure API routes have proper CORS headers
- Check environment variables are set correctly

**Redis Connection:**
- Verify REDIS_URL and REDIS_PASSWORD
- Check Redis service is running
- Ensure connection string format is correct

**Build Failures:**
- Check `react-chat-app/package.json` has correct build script
- Verify all dependencies are installed
- Check for any syntax errors in API files

## Performance Optimization

### Caching
- Static assets are cached for 1 year
- API responses are not cached by default

### Bundle Size
- React app is optimized during build
- Only necessary dependencies are included

### Function Performance
- Functions have 30-second timeout
- Cold starts are minimized with proper configuration

## Security

### Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

### Environment Variables
- Never commit secrets to Git
- Use Vercel's encrypted environment variables
- Rotate keys regularly

## Scaling

### Vercel Pro Plan
- Higher function execution limits
- Custom domains
- Advanced analytics
- Priority support

### Redis Scaling
- Upstash: Upgrade to paid tier for higher limits
- Redis Cloud: Scale vertically or use clustering

## Backup and Recovery

### Redis Data
- Upstash: Automatic backups included
- Redis Cloud: Manual backup configuration

### Code Backup
- Vercel stores deployment history
- Git provides version control

## Custom Domain

1. In Vercel dashboard, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed
4. Update environment variables if needed

## Continuous Deployment

### Automatic Deployments
- Connect Git repository
- Deploy on push to main branch
- Preview deployments for PRs

### Environment-Specific Config
- Use different Redis instances for staging/production
- Separate environment variables
- Feature flags for testing

## Troubleshooting Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] Redis service is accessible
- [ ] API routes return 200 status
- [ ] React app builds successfully
- [ ] CORS headers are present
- [ ] Functions are within time limits
- [ ] Bundle size is reasonable (< 1MB)

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Upstash Documentation](https://docs.upstash.com/)
- [Redis Documentation](https://redis.io/documentation)
- [React Documentation](https://reactjs.org/docs)

## Next Steps

After successful deployment:

1. Monitor performance in Vercel dashboard
2. Set up alerts for errors
3. Configure custom domain
4. Implement analytics
5. Set up backup strategies
6. Plan for scaling
