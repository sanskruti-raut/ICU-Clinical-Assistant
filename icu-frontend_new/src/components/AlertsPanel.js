import React from 'react';

function AlertsPanel({ alerts }) {
  return (
    <div className="card">
      <h2 className="card-title">Alerts</h2>
      {alerts.alert ? (
        <div className="alert alert-danger">
          {alerts.alert}
        </div>
      ) : (
        <p>No active alerts at this time.</p>
      )}
    </div>
  );
}

export default AlertsPanel;
