# Chat Application - Vercel Ready

A modern chat application with AI-powered responses, built with React and deployed on Vercel serverless functions.

## Features

- 🤖 AI-powered chat responses
- 💾 Conversation history with Redis persistence
- 🔄 Clear chat functionality
- 📱 Responsive design
- ⚡ Serverless API on Vercel
- 🔒 Security headers and CORS
- 📊 Real-time status monitoring

## Architecture

### Frontend (React)
- React 19 with hooks
- Tailwind CSS for styling
- Session storage for local state
- Floating chat interface

### Backend (Vercel Serverless)
- `/api/chat-memory` - Chat functionality
- `/api/status` - Health checks
- Redis for conversation persistence
- CORS and security headers

### Infrastructure
- Vercel for hosting and serverless functions
- Upstash Redis for data persistence
- Automatic deployments from Git

## Quick Start

### Prerequisites
- Node.js 18+
- Vercel account
- Redis service (Upstash recommended)

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd my-chat-project
   npm install
   cd react-chat-app && npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.vercel.example .env.local
   # Edit .env.local with your Redis credentials
   ```

3. **Local Development**
   ```bash
   npm run dev
   # or
   vercel dev
   ```

4. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## Configuration

### Environment Variables

Required:
```bash
REDIS_URL=redis://default:password@host:port
REDIS_PASSWORD=your-redis-password
```

Optional:
```bash
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_APP_NAME=Chat Application
EMBEDDING_API_URL=https://your-embedding-service.com
```

### Redis Setup

**Upstash Redis (Recommended):**
1. Create account at [Upstash Console](https://console.upstash.com/)
2. Create new Redis database
3. Copy REST URL and password
4. Add to Vercel environment variables

## API Documentation

### POST /api/chat-memory

**Chat Action:**
```json
{
  "message": "Hello!",
  "conversationId": "conv_123",
  "action": "chat"
}
```

**Get History:**
```json
{
  "conversationId": "conv_123",
  "action": "get"
}
```

**Clear History:**
```json
{
  "conversationId": "conv_123",
  "action": "clear"
}
```

### GET /api/status

Returns service health and version information.

## Project Structure

```
my-chat-project/
├── api/                    # Vercel serverless functions
│   ├── chat-memory.js       # Main chat API
│   └── status.js           # Health check
├── react-chat-app/          # React frontend
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   ├── ChatDrawer.js   # Chat interface
│   │   ├── ChatInput.js    # Message input
│   │   └── MessageList.js  # Message display
│   └── package.json
├── vercel.json            # Vercel configuration
├── package.json           # Root dependencies
└── README.md
```

## Deployment

### Automatic Deployment
1. Push to GitHub/GitLab/Bitbucket
2. Connect repository to Vercel
3. Auto-deploy on push to main branch

### Manual Deployment
```bash
vercel --prod
```

### Preview Deployments
```bash
vercel
```

## Development

### Local Development
```bash
# Install dependencies
npm install
cd react-chat-app && npm install

# Start development server
vercel dev
```

### Building
```bash
# Build React app
cd react-chat-app && npm run build

# Build for production
npm run build
```

## Monitoring

### Vercel Dashboard
- Function logs and performance
- Error tracking
- Analytics and metrics
- Deployment history

### Redis Monitoring
- Upstash Console or Redis Insight
- Connection metrics
- Memory usage

## Security

- CORS headers configured
- XSS protection headers
- Content Security Policy
- Environment variable encryption
- No sensitive data in client code

## Performance

- Serverless functions scale automatically
- Static asset caching (1 year)
- Optimized React build
- Redis connection pooling
- Function timeout optimization (30s)

## Troubleshooting

### Common Issues

**Redis Connection:**
- Verify REDIS_URL and REDIS_PASSWORD
- Check Redis service status
- Ensure proper connection string format

**Build Errors:**
- Check Node.js version (18+)
- Verify all dependencies installed
- Check for syntax errors in API files

**CORS Issues:**
- Ensure API routes have CORS headers
- Check environment variables
- Verify request origins

### Debug Mode
```bash
# Enable debug logging
DEBUG=* vercel dev
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test locally
5. Submit pull request

## License

MIT License - see LICENSE file for details.

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Upstash Documentation](https://docs.upstash.com/)
- [React Documentation](https://reactjs.org/docs)

## Roadmap

- [ ] AI model integration (GPT, Claude)
- [ ] File upload support
- [ ] User authentication
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Custom themes
- [ ] Voice input/output
