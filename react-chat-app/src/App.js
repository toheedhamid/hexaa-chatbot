import React, { useState, useEffect, useMemo } from 'react';
import FloatingActionButton from './FloatingActionButton';
import ChatDrawer from './ChatDrawer';
import Notification from './Notification';

const MAX_HISTORY = 20;

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Generate unique conversation ID
  const conversationId = useMemo(() => {
    const stored = sessionStorage.getItem('conversationId');
    if (stored) return stored;
    
    const newId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('conversationId', newId);
    return newId;
  }, []);
  
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    sessionStorage.setItem('chatHistory', JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages]);

  const handleSendMessage = (text, sender, metadata = {}) => {
    const newMessage = { 
      text, 
      sender, 
      timestamp: Date.now(),
      metadata 
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleFeedback = async (message, sentiment) => {
    // Update message state to reflect feedback
    setMessages(prev => prev.map(msg => 
      msg.timestamp === message.timestamp 
        ? { ...msg, feedback: sentiment }
        : msg
    ));

    // Show notification immediately
    setNotification('Your response has been received. Thank you for your feedback!');

    try {
      await fetch('/webhook/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.text,
          sentiment: sentiment,
          timestamp: message.timestamp,
          conversationId: conversationId
        })
      });
    } catch (error) {
      console.error('Failed to send feedback:', error);
      // Still show notification even if API call fails
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all chat history?')) {
      setMessages([]);
      sessionStorage.removeItem('chatHistory');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px', fontSize: '2.5rem' }}>
          Welcome to AI Assistant
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '30px' }}>
          Ask me about our services, pricing, support, and more!
        </p>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginTop: '20px'
        }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Try asking:</h2>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            textAlign: 'left',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {[
              'Hi! How are you?',
              'How much does a website cost?',
              'What payment methods do you accept?',
              'When is support available?',
              'Show me your case studies'
            ].map((question, idx) => (
              <li key={idx} style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid #e0e0e0'
              }}
              onClick={() => {
                setIsDrawerOpen(true);
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#e3f2fd';
                e.target.style.borderColor = '#007bff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#f8f9fa';
                e.target.style.borderColor = '#e0e0e0';
              }}
              >
                💬 {question}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <FloatingActionButton onClick={() => setIsDrawerOpen(!isDrawerOpen)} />
      <ChatDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onFeedback={handleFeedback}
        onClearChat={handleClearChat}
        isLoading={isLoading}
        setLoading={setIsLoading}
        conversationId={conversationId}
      />
      {notification && (
        <Notification 
          message={notification} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
}

export default App;