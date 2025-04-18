import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePatients } from '../../context/PatientContext';

const PriorityList = () => {
  const { 
    priorityPatients, 
    loading, 
    error, 
    getPatientById 
  } = usePatients();

  if (loading) {
    return (
      <Card title="Priority Patient List">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="Priority Patient List">
        <div className="text-red-500 p-4">{error}</div>
      </Card>
    );
  }

  // Sort by risk score (highest first)
  const sortedPatients = [...priorityPatients].sort(
    (a, b) => b.riskScore - a.riskScore
  );

  return (
    <Card 
      title="Priority Patient List"
      titleClassName="text-lg"
      contentClassName="p-0"
    >
      <ul className="divide-y divide-gray-200">
        {sortedPatients.length === 0 ? (
          <li className="px-4 py-4 text-center text-gray-500">
            No priority patients at this time
          </li>
        ) : (
          sortedPatients.map((priority) => {
            const patient = getPatientById(priority.patientId);
            
            return (
              <li 
                key={priority.patientId} 
                className="px-4 py-4 hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-start space-x-3">
                  <StatusBadge status={priority.riskScore} size="lg" />
                  
                  <div>
                    <Link 
                      to={`/patient/${priority.patientId}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      {patient ? patient.name : priority.patientId}
                    </Link>
                    
                    {patient && (
                      <div className="text-xs text-gray-500 mt-1">
                        {patient.diagnosis} | {patient.room}
                      </div>
                    )}
                    
                    {priority.unacknowledgedAlerts > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          {priority.unacknowledgedAlerts} unacknowledged alerts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  {priority.criticalLabs && priority.criticalLabs.length > 0 && (
                    <div className="text-xs text-right">
                      <span className="font-medium text-gray-700">Critical Values:</span>
                      <ul className="mt-1 space-y-1">
                        {priority.criticalLabs.map((lab, index) => (
                          <li key={index} className="text-red-600">
                            {lab}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
};

export default PriorityList;