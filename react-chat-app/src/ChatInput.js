import React, { useState, useEffect, useRef } from 'react';

function ChatInput({ onSendMessage, setLoading, isDrawerOpen, conversationId, WEBHOOK_URL }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const CHAT_API_URL = WEBHOOK_URL || `${API_BASE_URL}/chat-memory`;

  useEffect(() => {
    if (isDrawerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDrawerOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    onSendMessage(userMessage, 'user');
    setInput('');
    setLoading(true);

    try {
      console.log('Sending message:', userMessage);

      // Simplified API call to Vercel serverless function
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: conversationId || 'default',
          action: 'chat'
        })
      });

      console.log('Chat API response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Chat API response data:', data);

      // Handle response from Vercel API
      onSendMessage(data.message || 'I received your message.', 'bot', {
        type: 'chat',
        historyCount: data.historyCount || 0
      });
    } catch (error) {
      console.error('Error:', error);
      onSendMessage('Sorry, I encountered an error. Please try again.', 'bot', {
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '15px', borderTop: '1px solid #ddd', display: 'flex' }}>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
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