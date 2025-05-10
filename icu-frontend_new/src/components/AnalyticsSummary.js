import React from 'react';

function AnalyticsSummary({ analytics }) {
  if (!analytics) {
    return (
      <div className="card">
        <h2 className="card-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          ICU Analytics
        </h2>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Safely handle values that might be undefined
  const avgStayLength = analytics.avg_stay_length ? parseFloat(analytics.avg_stay_length).toFixed(2) : '0.00';
  const totalStays = analytics.total_stays ? Number(analytics.total_stays).toLocaleString() : '0';
  const totalVitals = analytics.total_vitals ? Number(analytics.total_vitals).toLocaleString() : '0';

  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        ICU Analytics
      </h2>
      <div className="analytics-grid">
        <div className="analytics-item">
          <div className="analytics-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>Average Stay Length</h3>
          <div className="analytics-value">{avgStayLength}</div>
          <div className="analytics-unit">days</div>
        </div>
        <div className="analytics-item">
          <div className="analytics-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>Total Stays</h3>
          <div className="analytics-value">{totalStays}</div>
          <div className="analytics-unit">patients</div>
        </div>
        <div className="analytics-item">
          <div className="analytics-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <h3>Total Vitals Recorded</h3>
          <div className="analytics-value">{totalVitals}</div>
          <div className="analytics-unit">measurements</div>
        </div>
      </div>
      <style jsx="true">{`
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }
        .analytics-item {
          background-color: #f5f7fa;
          border-radius: 12px;
          padding: 20px 15px;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .analytics-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        .analytics-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #e3f2fd;
          color: #1976d2;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .analytics-item h3 {
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          margin-bottom: 10px;
        }
        .analytics-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1976d2;
          line-height: 1;
        }
        .analytics-unit {
          font-size: 0.8rem;
          color: #888;
          margin-top: 5px;
        }
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px;
        }
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border-left-color: #1976d2;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AnalyticsSummary;
