import React from 'react';

function MessageList({ messages, onFeedback, isLoading, onOptionClick, CALENDLY_LINK }) {
  
  const renderMessage = (msg, index) => {
    const isBot = msg.sender === 'bot';
    const metadata = msg.metadata || {};
    const responseType = metadata.type || 'answer';

    return (
      <div 
        key={index} 
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexDirection: isBot ? 'row' : 'row-reverse'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
          backgroundColor: isBot ? '#e3f2fd' : '#f5f5f5'
        }}>
          {isBot ? '🤖' : '👤'}
        </div>

        {/* Message Content */}
        <div style={{ flex: 1, maxWidth: '85%' }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: isBot ? '#ffffff' : '#007bff',
            color: isBot ? '#333' : '#ffffff',
            border: isBot ? '1px solid #e0e0e0' : 'none',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            
            {/* ESCALATION MESSAGE */}
            {responseType === 'escalation' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ff9800',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  ⚠️ Escalation Suggested
                </div>
                <div style={{ whiteSpace: 'pre-line', marginBottom: '12px' }}>
                  {msg.text}
                </div>
                
                {/* Action Buttons */}
                {metadata.options && metadata.options.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {metadata.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => onOptionClick(option)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          backgroundColor: 
                            option.id === 'book' ? '#007bff' :
                            option.id === 'email' ? '#28a745' :
                            '#6c757d',
                          color: 'white',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                        onMouseOut={(e) => e.target.style.opacity = '1'}
                      >
                        {option.id === 'book' && '📅 '}
                        {option.id === 'email' && '✉️ '}
                        {option.id === 'continue' && '💬 '}
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GUARDRAIL MESSAGE */}
            {responseType === 'guardrail' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#ff5722',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  🚫 Off-Topic Detected
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            )}

            {/* CLARIFICATION MESSAGE */}
            {responseType === 'clarification' && (
              <div style={{ whiteSpace: 'pre-line' }}>
                {msg.text}
              </div>
            )}

            {/* GREETING MESSAGE */}
            {responseType === 'greeting' && (
              <div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
                {metadata.intent && (
                  <div style={{
                    fontSize: '11px',
                    color: '#666',
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Intent: {metadata.intent}
                    {metadata.confidence && ` (${(metadata.confidence * 100).toFixed(0)}% confidence)`}
                  </div>
                )}
              </div>
            )}

            {/* NORMAL ANSWER */}
            {(responseType === 'answer' || !responseType) && (
              <div>
                <div style={{ whiteSpace: 'pre-line', marginBottom: metadata.sources?.length > 0 ? '12px' : '0' }}>
                  {msg.text}
                </div>
                
                {/* Sources */}
                {metadata.sources && metadata.sources.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>
                      📚 Sources Used:
                    </div>
                    {metadata.sources.slice(0, 3).map((source, i) => (
                      <div key={i} style={{
                        fontSize: '11px',
                        color: '#555',
                        backgroundColor: '#f8f9fa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        marginBottom: '4px'
                      }}>
                        {source.topic} • {source.page} • {(parseFloat(source.score) * 100).toFixed(0)}% confidence
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUMMARY MESSAGE */}
            {responseType === 'summary' && (
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#007bff'
                }}>
                  📝 Conversation Summary
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            )}

            {/* CASE STUDIES MESSAGE */}
            {responseType === 'case_studies' && (
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#007bff'
                }}>
                  📂 Case Studies {metadata.count && `(${metadata.count})`}
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>
                  {msg.text}
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {responseType === 'error' && (
              <div style={{ color: '#dc3545' }}>
                ❌ {msg.text}
              </div>
            )}
          </div>

          {/* Timestamp and Feedback */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '4px',
            fontSize: '11px',
            color: '#999',
            flexDirection: isBot ? 'row' : 'row-reverse'
          }}>
            <span>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            {/* Feedback buttons for bot messages */}
            {isBot && (
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onFeedback(msg, 'positive')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    fontSize: '14px',
                    color: msg.feedback === 'positive' ? '#28a745' : '#ccc'
                  }}
                  title="Helpful"
                >
                  👍
                </button>
                <button
                  onClick={() => onFeedback(msg, 'negative')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '2px 4px',
                    fontSize: '14px',
                    color: msg.feedback === 'negative' ? '#dc3545' : '#ccc'
                  }}
                  title="Not helpful"
                >
                  👎
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      {messages.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#999'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
          <div style={{ fontSize: '14px' }}>Start a conversation!</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Ask me anything about our services.</div>
        </div>
      )}
      
      {messages.map((msg, index) => renderMessage(msg, index))}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🤖
          </div>
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0s' }}>●</span>
              <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.2s' }}>●</span>
              <span style={{ animation: 'bounce 1.4s infinite', animationDelay: '0.4s' }}>●</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

export default MessageList;