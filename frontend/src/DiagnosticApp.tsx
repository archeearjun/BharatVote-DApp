import React from 'react';

const DiagnosticApp: React.FC = () => {
  console.log('DiagnosticApp: Component is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔍 BharatVote Diagnostic Mode</h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>✅ React App is Working</h2>
        <p>If you can see this message, React is working correctly.</p>
        <p><strong>Current URL:</strong> {window.location.href}</p>
        <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Browser Environment Check:</h3>
          <ul>
            <li>User Agent: {navigator.userAgent}</li>
            <li>LocalStorage Available: {typeof Storage !== 'undefined' ? '✅' : '❌'}</li>
            <li>Ethereum Available: {typeof (window as any).ethereum !== 'undefined' ? '✅' : '❌'}</li>
          </ul>
        </div>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          🔄 Reload Page
        </button>
      </div>
    </div>
  );
};

export default DiagnosticApp;
