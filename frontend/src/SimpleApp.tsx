import React from 'react';

const SimpleApp: React.FC = () => {
  console.log('SimpleApp: Component is rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Inter, Arial, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>🗳️ BharatVote - Simple Mode</h1>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#334155', marginBottom: '15px' }}>✅ App is Working</h2>
        <p style={{ color: '#64748b', lineHeight: '1.6' }}>
          This simplified version confirms that React is working properly. 
          The issue is likely in the main App component.
        </p>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
          <h3 style={{ color: '#475569', marginBottom: '10px' }}>Environment Status:</h3>
          <ul style={{ color: '#64748b', paddingLeft: '20px' }}>
            <li>Current Time: {new Date().toLocaleString()}</li>
            <li>URL: {window.location.href}</li>
            <li>MetaMask: {typeof (window as any).ethereum !== 'undefined' ? '✅ Available' : '❌ Not Available'}</li>
            <li>LocalStorage: {typeof Storage !== 'undefined' ? '✅ Working' : '❌ Not Working'}</li>
          </ul>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.location.href = 'http://localhost:5173/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Try Main App
          </button>
          
          <button 
            onClick={() => window.location.href = 'http://localhost:5173/?diagnostic'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔍 Diagnostic Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleApp;
