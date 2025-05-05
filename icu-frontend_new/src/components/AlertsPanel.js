import React from 'react';

function AlertsPanel({ alerts }) {
  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Alerts
      </h2>
      
      {alerts.alerts && alerts.alerts.length > 0 ? (
        <div className="alerts-container">
          {alerts.alerts.map((alert, index) => {
            // Extract patient ID for styling
            const patientIdMatch = alert.match(/Patient\s+(\d+)/);
            const patientId = patientIdMatch ? patientIdMatch[1] : '';
            const alertType = alert.includes('Heart Rate') ? 'heart-rate' : 'blood-pressure';
            
            return (
              <div 
                key={index} 
                className="alert alert-danger"
                style={{
                  margin: '8px 0',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  animation: 'fadeIn 0.5s ease-in-out'
                }}
              >
                <div 
                  style={{ 
                    marginRight: '12px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 9v2M12 15h.01"></path>
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  </svg>
                </div>
                
                <div>
                  {alert.split(' for Patient ')[0]}
                  <span style={{ 
                    display: 'inline-block', 
                    backgroundColor: '#f8d7da', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    marginLeft: '8px',
                    fontSize: '0.9em',
                    fontWeight: 'bold'
                  }}>
                    Patient {patientId}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No active alerts at this time.</p>
      )}
      
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .alerts-container {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default AlertsPanel;
