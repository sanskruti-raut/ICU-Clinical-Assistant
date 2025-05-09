import React from 'react';
import { Link } from 'react-router-dom';

function SepsisAlerts({ alerts }) {
  // If no alerts or empty array, show no alerts message
  if (!alerts || !alerts.length) {
    return (
      <div className="card">
        <h2 className="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Sepsis Risk Alerts
        </h2>
        <p className="no-alerts-message">No sepsis risk alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        Sepsis Risk Alerts
      </h2>
      
      <div className="sepsis-alerts-container">
        {alerts.map((alert, index) => {
          const riskLevel = getRiskLevel(alert.risk_score);
          
          return (
            <div 
              key={index} 
              className={`alert alert-${riskLevel.className}`}
            >
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              
              <div className="alert-content">
                <div className="alert-title">
                  <span className="risk-badge">{formatRiskScore(alert.risk_score)}</span>
                  <span className="risk-level">{riskLevel.label} Risk</span>
                </div>
                <div className="alert-details">
                  Patient <Link to={`/patient/${alert.subject_id}`} className="patient-link">{alert.subject_id}</Link>
                  {alert.timestamp && 
                    <span className="timestamp">
                      {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx="true">{`
        .sepsis-alerts-container {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .alert {
          margin: 8px 0;
          padding: 12px 15px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          animation: fadeIn 0.5s ease-in-out;
          position: relative;
        }
        
        .alert-danger {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
        }
        
        .alert-warning {
          background-color: #fff8e1;
          border-left: 4px solid #ff9800;
        }
        
        .alert-success {
          background-color: #e8f5e9;
          border-left: 4px solid #4caf50;
        }
        
        .alert-icon {
          display: flex;
          margin-right: 12px;
          color: #f44336;
          flex-shrink: 0;
        }
        
        .alert-danger .alert-icon {
          color: #f44336;
        }
        
        .alert-warning .alert-icon {
          color: #ff9800;
        }
        
        .alert-success .alert-icon {
          color: #4caf50;
        }
        
        .alert-content {
          flex: 1;
        }
        
        .alert-title {
          font-weight: 500;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
        }
        
        .alert-details {
          font-size: 0.9em;
          color: #555;
          display: flex;
          align-items: center;
        }
        
        .risk-badge {
          display: inline-block;
          font-weight: bold;
          margin-right: 8px;
        }
        
        .risk-level {
          font-size: 0.9em;
        }
        
        .patient-link {
          color: #1976d2;
          font-weight: 500;
          text-decoration: none;
          margin: 0 4px;
        }
        
        .patient-link:hover {
          text-decoration: underline;
        }
        
        .timestamp {
          margin-left: auto;
          font-size: 0.85em;
          color: #777;
        }
        
        .no-alerts-message {
          padding: 15px 0;
          color: #757575;
          font-style: italic;
          text-align: center;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Helper function to format risk score as percentage
function formatRiskScore(score) {
  return `${(score * 100).toFixed(1)}%`;
}

// Helper function to get risk level info
function getRiskLevel(score) {
  if (score >= 0.7) {
    return { label: 'High', className: 'danger' };
  } else if (score >= 0.4) {
    return { label: 'Medium', className: 'warning' };
  } else {
    return { label: 'Low', className: 'success' };
  }
}

export default SepsisAlerts;
