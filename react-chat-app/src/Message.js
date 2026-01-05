import React from 'react';

function Message({ message, onFeedback, onOptionClick }) {
  const isUser = message.sender === 'user';
  const type = message.metadata?.type;
  const sources = message.metadata?.sources || [];
  const options = message.metadata?.options || [];
  
  const getStyles = () => {
    const baseStyle = {
      padding: '14px 18px',
      borderRadius: '12px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      fontSize: '14px',
      lineHeight: '1.7',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      border: '2px solid'
    };

    if (isUser) {
      return {
        ...baseStyle,
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#0056b3'
      };
    }

    switch (type) {
      case 'greeting':
        return {
          ...baseStyle,
          backgroundColor: '#e3f2fd',
          color: '#1565c0',
          borderColor: '#90caf9',
          textAlign: 'center'
        };
      case 'escalation':
        return {
          ...baseStyle,
          backgroundColor: '#fff5f5',
          color: '#721c24',
          borderColor: '#f5c6cb'
        };
      case 'guardrail':
        return {
          ...baseStyle,
          backgroundColor: '#fff9e6',
          color: '#856404',
          borderColor: '#ffeaa7'
        };
      case 'clarification':
        return {
          ...baseStyle,
          backgroundColor: '#e7f3ff',
          color: '#004085',
          borderColor: '#b8daff'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderColor: '#ef9a9a'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#f5f5f5',
          color: '#333',
          borderColor: '#e0e0e0'
        };
    }
  };

  const getIcon = () => {
    if (isUser) return null;
    
    switch (type) {
      case 'greeting': return '👋';
      case 'escalation': return '🆘';
      case 'guardrail': return '⚠️';
      case 'clarification': return '❓';
      case 'error': return '❌';
      default: return '🤖';
    }
  };

  const icon = getIcon();
  const styles = getStyles();
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '18px',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '88%'
      }}>
        <div style={styles}>
          {icon && (
            <div style={{ 
              fontSize: '24px', 
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              {icon}
            </div>
          )}
          
          <div>{message.text}</div>
          
          {/* Escalation options */}
          {type === 'escalation' && options.length > 0 && (
            <div style={{ 
              marginTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: '16px'
            }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600',
                marginBottom: '4px',
                color: '#721c24'
              }}>
                Choose an option:
              </div>
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onOptionClick && onOptionClick(option)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: option.id === 'book' ? '#dc3545' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Sources */}
          {sources.length > 0 && type === 'answer' && (
            <div style={{ 
              marginTop: '16px', 
              paddingTop: '12px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                📚 Sources ({sources.length}):
              </div>
              <ul style={{ margin: '0', paddingLeft: '20px', listStyle: 'none' }}>
                {sources.map((source, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#007bff' }}>•</span>
                    {' '}
                    <strong>{source.topic}</strong> ({source.page})
                    {source.score && (
                      <span style={{ 
                        marginLeft: '8px',
                        padding: '2px 6px',
                        backgroundColor: 'rgba(0,123,255,0.1)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {(parseFloat(source.score) * 100).toFixed(0)}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Intent & confidence for greeting/answer */}
          {(type === 'greeting' || type === 'answer') && message.metadata?.intent && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              fontSize: '11px',
              opacity: 0.7,
              fontStyle: 'italic'
            }}>
              <div>Intent: {message.metadata.intent}</div>
              {message.metadata.confidence && (
                <div>Confidence: {(message.metadata.confidence * 100).toFixed(0)}%</div>
              )}
            </div>
          )}
        </div>
        
        {/* Feedback buttons */}
        {!isUser && type === 'answer' && onFeedback && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: '10px'
          }}>
            <span style={{ fontSize: '11px', color: '#666' }}>Was this helpful?</span>
            <button 
              onClick={() => onFeedback(message, 'positive')}
              style={{ 
                background: message.feedback === 'positive' ? '#e8f5e9' : 'white',
                border: `2px solid ${message.feedback === 'positive' ? '#4caf50' : '#e0e0e0'}`,
                borderRadius: '8px',
                cursor: 'pointer', 
                fontSize: '18px',
                padding: '6px 10px'
              }}
            >
              👍
            </button>
            <button 
              onClick={() => onFeedback(message, 'negative')}
              style={{ 
                background: message.feedback === 'negative' ? '#ffebee' : 'white',
                border: `2px solid ${message.feedback === 'negative' ? '#f44336' : '#e0e0e0'}`,
                borderRadius: '8px',
                cursor: 'pointer', 
                fontSize: '18px',
                padding: '6px 10px'
              }}
            >
              👎
            </button>
          </div>
        )}
      </div>
      
      <style>
        {`
          @keyframes slideIn {
            from { 
              opacity: 0; 
              transform: translateY(15px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
        `}
      </style>
    </div>
  );
}

export default Message;