import React from 'react';
import { Link } from 'react-router-dom';

function AlertsPanel({ alerts }) {
  // If no alerts or empty array, show no alerts message
  if (!alerts.alerts || alerts.alerts.length === 0) {
    return (
      <div className="card">
        <h2 className="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          Alerts for Heart Rate
        </h2>
        <p className="no-alerts-message">No active heart rate alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        Alerts for Heart Rate
      </h2>
      
      <div className="sepsis-alerts-container">
        {alerts.alerts.map((alert, index) => {
          // Extract patient ID and heart rate value
          const patientIdMatch = alert.match(/Patient\s+(\d+)/);
          const patientId = patientIdMatch ? patientIdMatch[1] : '';
          
          const heartRateMatch = alert.match(/Heart Rate = (\d+)/);
          const heartRate = heartRateMatch ? heartRateMatch[1] : '';
          
          return (
            <div 
              key={index} 
              className="alert alert-danger"
            >
              <div className="alert-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                </svg>
              </div>
              
              <div className="alert-content">
                <div className="alert-title">
                  <span className="risk-badge">{heartRate}</span>
                  <span className="risk-level">High Heart Rate</span>
                </div>
                <div className="alert-details">
                  Patient <Link to={`/patient/${patientId}`} className="patient-link">{patientId}</Link>
                  <span className="timestamp">
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
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
          background-color: #ffebee;
          border-left: 4px solid #f44336;
        }
        
        .alert-danger {
          background-color: #ffebee;
          border-left: 4px solid #f44336;
        }
        
        .alert-icon {
          display: flex;
          margin-right: 12px;
          color: #f44336;
          flex-shrink: 0;
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

export default AlertsPanel;
