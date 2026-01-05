// Vercel serverless function for chat memory management
// Replaces n8n workflow functionality

const Redis = require('ioredis');

// Initialize Redis client
let redis = null;

async function getRedisClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }
  return redis;
}

// Helper function to generate embedding (simplified version)
async function generateEmbedding(text) {
  // In production, you'd call an embedding service
  // For now, return a mock embedding
  return new Array(384).fill(0).map(() => Math.random());
}

// Helper function to generate bot response
async function generateBotResponse(userMessage, conversationHistory) {
  // Simple response generation - in production you'd use an AI service
  const responses = [
    `I understand you said: "${userMessage}"`,
    `That's interesting about: "${userMessage}"`,
    `I received your message: "${userMessage}"`,
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const messageCount = conversationHistory.filter(msg => msg.role === 'user').length;
  
  return `${randomResponse}. This is message #${messageCount + 1} in our conversation.`;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { body } = req;
    const conversationId = body.conversationId || `conv_${Date.now()}`;
    const userMessage = body.message || '';
    const action = body.action || 'chat';

    const redisClient = await getRedisClient();
    const redisKey = `chat:${conversationId}`;

    switch (action) {
      case 'chat':
        return await handleChat(redisClient, redisKey, conversationId, userMessage, res);
      
      case 'get':
        return await handleGet(redisClient, redisKey, conversationId, res);
      
      case 'clear':
        return await handleClear(redisClient, redisKey, conversationId, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Chat memory error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleChat(redisClient, redisKey, conversationId, userMessage, res) {
  // Get existing conversation history
  let existingHistory = [];
  try {
    const stored = await redisClient.get(redisKey);
    if (stored) {
      existingHistory = JSON.parse(stored);
    }
  } catch (error) {
    console.log('No existing history, starting fresh');
  }

  // Add new user message
  const newUserMessage = {
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString()
  };

  const newHistory = [...existingHistory, newUserMessage];

  // Generate bot response
  const botResponse = {
    role: 'assistant',
    content: await generateBotResponse(userMessage, existingHistory),
    timestamp: new Date().toISOString()
  };

  newHistory.push(botResponse);

  // Keep only last 20 messages (10 conversation turns)
  let finalHistory = newHistory;
  if (newHistory.length > 20) {
    finalHistory = newHistory.slice(-20);
  }

  // Store updated history in Redis
  await redisClient.setex(redisKey, 86400, JSON.stringify(finalHistory)); // 24 hours TTL

  return res.status(200).json({
    conversationId,
    message: botResponse.content,
    historyCount: finalHistory.filter(msg => msg.role === 'user').length,
    timestamp: new Date().toISOString()
  });
}

async function handleGet(redisClient, redisKey, conversationId, res) {
  let history = [];
  let message = 'No history found';

  try {
    const stored = await redisClient.get(redisKey);
    if (stored) {
      history = JSON.parse(stored);
      const userMessages = history.filter(msg => msg.role === 'user').length;
      message = `Retrieved ${userMessages} conversation turns`;
    }
  } catch (error) {
    message = 'Error retrieving history';
  }

  return res.status(200).json({
    conversationId,
    action: 'get',
    message,
    history,
    historyCount: history.filter(msg => msg.role === 'user').length,
    timestamp: new Date().toISOString()
  });
}

async function handleClear(redisClient, redisKey, conversationId, res) {
  try {
    await redisClient.del(redisKey);
    return res.status(200).json({
      conversationId,
      action: 'clear',
      message: 'Chat history cleared successfully',
      status: 'success',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      conversationId,
      action: 'clear',
      message: 'Error clearing chat history',
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
}
