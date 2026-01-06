import React, { useState, useEffect, useRef } from 'react';

function ChatInput({ onSendMessage, setLoading, isDrawerOpen, conversationId, WEBHOOK_URL }) {
  // Get n8n URL from environment or use local fallback
  const N8N_BASE_URL = WEBHOOK_URL?.split('/webhook')[0] || 
                       process.env.REACT_APP_N8N_BASE_URL || 
                       process.env.NEXT_PUBLIC_N8N_BASE_URL ||
                       'http://localhost:5678';
  
  const CHAT_API_URL = WEBHOOK_URL || `${N8N_BASE_URL}/webhook/answer`;

  console.log('🔧 ChatInput Config:', {
    N8N_BASE_URL,
    CHAT_API_URL,
    conversationId
  });

  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isDrawerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDrawerOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    
    // Show user message immediately
    console.log('📤 Sending user message:', userMessage);
    onSendMessage(userMessage, 'user');
    setInput('');
    setLoading(true);

    try {
      console.log('🌐 Calling API:', CHAT_API_URL);
      
      const requestBody = { 
        text: userMessage,
        conversationId: conversationId || `conv_${Date.now()}`
      };
      
      console.log('📦 Request body:', requestBody);

      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response data:', data);
      console.log('📋 Response keys:', Object.keys(data));

      // ✅ EXTRACT MESSAGE - Your n8n returns: { type, message, intent, confidence }
      let botMessage = '';
      let metadata = {};

      // Check response structure
      if (data.type && data.message) {
        // ✅ YOUR FORMAT: { type: 'direct_response', message: '...', intent: '...' }
        botMessage = data.message;
        metadata = {
          type: data.type,
          intent: data.intent,
          confidence: data.confidence,
          sources: data.sources || []
        };
        console.log('✅ Found message in data.message:', botMessage);
      }
      // Fallback formats
      else if (data.response_message) {
        botMessage = data.response_message;
        console.log('✅ Found message in data.response_message');
      }
      else if (data.text) {
        botMessage = data.text;
        console.log('✅ Found message in data.text');
      }
      else if (data.answer) {
        botMessage = data.answer;
        console.log('✅ Found message in data.answer');
      }
      // Array format from n8n
      else if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        botMessage = firstItem.message || firstItem.text || firstItem.answer || '';
        metadata = {
          type: firstItem.type,
          intent: firstItem.intent,
          confidence: firstItem.confidence
        };
        console.log('✅ Found message in array format');
      }
      else {
        console.warn('⚠️ Unknown response format:', data);
        botMessage = 'I received your message but the response format was unexpected.';
      }

      // Validate message
      if (!botMessage || botMessage.trim().length === 0) {
        console.error('❌ Bot message is empty!');
        console.error('Response data:', data);
        botMessage = 'I received your message but could not extract a response.';
      }

      console.log('💬 Final bot message:', botMessage);
      console.log('📊 Metadata:', metadata);

      // Send bot message to UI
      onSendMessage(botMessage, 'bot', metadata);
      console.log('✅ Message sent to UI');

    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Sorry, I encountered an error.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = `🔌 Cannot connect to chat server.\n\n` +
          `Trying to reach: ${CHAT_API_URL}\n\n` +
          `Please check:\n` +
          `• Is n8n running and accessible?\n` +
          `• Is the URL correct?\n` +
          `• Are CORS headers configured?`;
      } else {
        errorMessage = `❌ Error: ${error.message}\n\nPlease try again.`;
      }
      
      onSendMessage(errorMessage, 'bot', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      padding: '15px', 
      borderTop: '1px solid #ddd', 
      display: 'flex',
      backgroundColor: '#fff'
    }}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        disabled={isLoading}
        style={{
          flex: 1,
          padding: '12px 16px',
          border: '2px solid #e0e0e0',
          borderRadius: '10px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#007bff'}
        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
      />
      <button
        type="submit"
        disabled={!input.trim()}
        style={{
          marginLeft: '12px',
          padding: '12px 24px',
          backgroundColor: input.trim() ? '#007bff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          cursor: input.trim() ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '700',
          transition: 'all 0.2s',
          boxShadow: input.trim() ? '0 2px 4px rgba(0,123,255,0.3)' : 'none'
        }}
      >
        Send
      </button>
    </form>
  );
}

export default ChatInput;