import React from 'react';

function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '10px',
      marginBottom: '10px'
    }}>
      <div style={{
        padding: '10px 15px',
        borderRadius: '10px',
        backgroundColor: '#e9ecef',
        display: 'flex',
        gap: '5px'
      }}>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0s'
        }}></span>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0.2s'
        }}></span>
        <span style={{ 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          backgroundColor: '#666',
          animation: 'bounce 1.4s infinite ease-in-out both',
          animationDelay: '0.4s'
        }}></span>
      </div>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
}

export default TypingIndicator;