import React, { useState, useEffect, useRef } from 'react';

// Complete chat interface component
function ChatInterface({ isDrawerOpen = true }) {
  // State - load from localStorage if available
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('n8n_chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => {
    const saved = localStorage.getItem('n8n_chat_conversation_id');
    return saved || `conv_${Date.now()}`;
  });
  
  // Refs
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Your PRODUCTION Railway n8n URL
  const N8N_PRODUCTION_URL = 'https://n8n-main-instance-production-0ed4.up.railway.app';
  const CHAT_API_URL = `${N8N_PRODUCTION_URL}/webhook/answer`;

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('n8n_chat_messages', JSON.stringify(messages));
    localStorage.setItem('n8n_chat_conversation_id', conversationId);
  }, [messages, conversationId]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isDrawerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDrawerOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add a message to chat
  const addMessage = (text, sender, metadata = {}) => {
    const newMessage = {
      id: Date.now(),
      text: text,
      sender: sender,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Extract message from n8n response
  const extractMessage = (data) => {
    if (!data) return 'No response received from n8n';
    
    // Try different response formats in order
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    
    if (data.response_message && typeof data.response_message === 'string') {
      return data.response_message;
    }
    
    if (data.json) {
      if (data.json.response_message && typeof data.json.response_message === 'string') {
        return data.json.response_message;
      }
      if (data.json.message && typeof data.json.message === 'string') {
        return data.json.message;
      }
    }
    
    if (data.text && typeof data.text === 'string') {
      return data.text;
    }
    
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem.json) {
        if (firstItem.json.response_message) return firstItem.json.response_message;
        if (firstItem.json.message) return firstItem.json.message;
        if (firstItem.json.text) return firstItem.json.text;
      }
      if (firstItem.response_message) return firstItem.response_message;
      if (firstItem.message) return firstItem.message;
    }
    
    if (data.type === 'direct_response') {
      if (data.message) return data.message;
      if (data.text) return data.text;
    }
    
    // If nothing matches, show formatted response
    const responseStr = JSON.stringify(data, null, 2);
    if (responseStr.length < 200) {
      return `Response: ${responseStr}`;
    }
    
    return 'Received response but could not extract message.';
  };

  // Handle sending message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    
    // Add user message to chat
    addMessage(userMessage, 'user');
    
    // Clear input and show loading
    setInput('');
    setLoading(true);

    try {
      const requestBody = { 
        text: userMessage, 
        conversationId: conversationId
      };

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      // Extract bot message
      const botMessage = extractMessage(data);
      
      // Add bot message to chat
      addMessage(botMessage, 'bot', {
        intent: data.intent || data.json?.intent,
        confidence: data.confidence || data.json?.confidence
      });

    } catch (error) {
      console.error('Error:', error);
      addMessage(`Sorry, there was an error processing your message.`, 'bot', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Clear chat (with confirmation)
  const clearChat = () => {
    if (messages.length > 0) {
      if (window.confirm('Are you sure you want to clear the chat history?')) {
        setMessages([]);
        // Generate new conversation ID
        const newId = `conv_${Date.now()}`;
        localStorage.setItem('n8n_chat_conversation_id', newId);
        window.location.reload(); // Refresh to use new ID
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Chat Assistant</h3>
          {messages.length > 0 && (
            <small style={styles.messageCount}>
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </small>
          )}
        </div>
        <div style={styles.headerRight}>
          {messages.length > 0 && (
            <button onClick={clearChat} style={styles.clearButton}>
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div style={styles.messagesArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.welcomeIcon}>💬</div>
            <p style={styles.welcomeText}>Start a conversation</p>
            <p style={styles.instructionText}>Type a message below to begin chatting</p>
            <p style={styles.exampleText}>Try asking: "What services do you offer?" or "Tell me about pricing"</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{
                ...styles.messageBubble,
                ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble)
              }}
            >
              <div style={styles.messageHeader}>
                <div style={styles.senderInfo}>
                  <span style={styles.senderIcon}>
                    {msg.sender === 'user' ? '👤' : '🤖'}
                  </span>
                  <strong style={styles.senderName}>
                    {msg.sender === 'user' ? 'You' : 'Assistant'}
                  </strong>
                </div>
                <span style={styles.timestamp}>{msg.timestamp}</span>
              </div>
              <div style={styles.messageContent}>{msg.text}</div>
              {msg.intent && (
                <div style={styles.metadata}>
                  <span style={styles.intentText}>{msg.intent}</span>
                  {msg.confidence && (
                    <span style={styles.confidenceText}>
                      ({Math.round(msg.confidence * 100)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          style={styles.inputField}
          disabled={loading}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            ...styles.sendButton,
            backgroundColor: (input.trim() && !loading) ? '#007bff' : '#ccc',
            cursor: (input.trim() && !loading) ? 'pointer' : 'not-allowed'
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    backgroundColor: '#007bff',
    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
    color: 'white',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  messageCount: {
    fontSize: '12px',
    opacity: 0.9,
    fontWeight: '500',
  },
  headerRight: {
    display: 'flex',
    gap: '10px',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  messagesArea: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
    backgroundColor: '#f8f9fa',
    minHeight: '400px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6c757d',
  },
  welcomeIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  welcomeText: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#343a40',
  },
  instructionText: {
    fontSize: '14px',
    marginBottom: '8px',
    color: '#6c757d',
  },
  exampleText: {
    fontSize: '13px',
    color: '#adb5bd',
    fontStyle: 'italic',
    marginBottom: '24px',
  },
  messageBubble: {
    marginBottom: '16px',
    padding: '16px 20px',
    borderRadius: '18px',
    maxWidth: '85%',
    wordWrap: 'break-word',
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
    animation: 'fadeIn 0.3s ease-out',
  },
  userBubble: {
    backgroundColor: '#007bff',
    color: 'white',
    marginLeft: 'auto',
    borderBottomRightRadius: '5px',
  },
  botBubble: {
    backgroundColor: 'white',
    color: '#343a40',
    marginRight: 'auto',
    borderBottomLeftRadius: '5px',
    border: '1px solid #e9ecef',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '12px',
    opacity: 0.9,
  },
  senderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  senderIcon: {
    fontSize: '14px',
  },
  senderName: {
    textTransform: 'capitalize',
    fontSize: '13px',
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.7,
  },
  messageContent: {
    fontSize: '15px',
    lineHeight: '1.5',
    marginBottom: '8px',
  },
  metadata: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px dashed rgba(0,0,0,0.1)',
    fontSize: '12px',
    color: '#6c757d',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  intentText: {
    color: '#28a745',
    fontWeight: '600',
  },
  confidenceText: {
    color: '#6c757d',
    fontSize: '11px',
  },
  inputForm: {
    display: 'flex',
    padding: '20px',
    borderTop: '1px solid #e9ecef',
    backgroundColor: 'white',
  },
  inputField: {
    flex: 1,
    padding: '14px 18px',
    border: '2px solid #e0e0e0',
    borderRadius: '25px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputFieldFocus: {
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0,123,255,0.1)',
  },
  sendButton: {
    marginLeft: '12px',
    padding: '14px 28px',
    color: 'white',
    border: 'none',
    borderRadius: '25px',
    fontSize: '15px',
    fontWeight: '600',
    minWidth: '90px',
    transition: 'all 0.2s',
  },
  '@global': {
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(10px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
  },
};

export default ChatInterface;