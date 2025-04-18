import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAlerts } from '../../context/AlertContext';
import { usePatients } from '../../context/PatientContext';

const AlertsFeed = () => {
  const { alerts, loading, error, formatTimeSince, acknowledgeAlert } = useAlerts();
  const { getPatientById } = usePatients();

  if (loading) {
    return (
      <Card title="Real-Time Alerts">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Real-Time Alerts">
        <div className="text-red-500 p-4">{error}</div>
      </Card>
    );
  }

  // Filter function to determine alert severity
  const getAlertSeverity = (alert) => {
    if (alert.type === 'Sepsis risk > 80%' || alert.type === 'HR critical') {
      return 'critical';
    }
    return 'warning';
  };

  return (
    <Card 
      title="Real-Time Alerts"
      titleClassName="text-lg"
      headerAction={
        <button 
          className="text-xs text-blue-600 hover:text-blue-800"
          onClick={() => console.log('View all alerts')}
        >
          View All
        </button>
      }
    >
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No alerts at this time
          </div>
        ) : (
          alerts.map((alert) => {
            const patient = getPatientById(alert.patientId);
            
            return (
              <div 
                key={`${alert.patientId}-${alert.time}`}
                className="flex items-start p-3 border border-gray-100 rounded-md shadow-sm hover:bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <StatusBadge status={getAlertSeverity(alert)} size="sm" className="uppercase" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.type}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTimeSince(alert.time)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Link to={`/patient/${alert.patientId}`} className="text-sm text-blue-600 hover:text-blue-800">
                      {patient ? `${patient.name} (${patient.room})` : alert.patientId}
                    </Link>
                  </div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <button
                    onClick={() => acknowledgeAlert(alert.patientId + alert.time)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default AlertsFeed;