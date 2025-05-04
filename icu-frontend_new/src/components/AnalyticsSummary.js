import React from 'react';

function AnalyticsSummary({ analytics }) {
  if (!analytics) {
    return (
      <div className="card">
        <h2 className="card-title">ICU Analytics</h2>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">ICU Analytics</h2>
      <div className="analytics-grid">
        <div className="analytics-item">
          <h3>Average Stay Length</h3>
          <div className="analytics-value">{analytics.avg_stay_length} days</div>
        </div>
        <div className="analytics-item">
          <h3>Total Stays</h3>
          <div className="analytics-value">{analytics.total_stays}</div>
        </div>
        <div className="analytics-item">
          <h3>Total Vitals Recorded</h3>
          <div className="analytics-value">{analytics.total_vitals}</div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsSummary;
