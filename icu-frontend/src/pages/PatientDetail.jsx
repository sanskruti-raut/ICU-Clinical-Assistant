import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { usePatients } from '../context/PatientContext';
import { useAlerts } from '../context/AlertContext';
import { formatDateTime, formatTimeSince } from '../utils/formatters';
import { getSepsisRiskLabel, getVitalStatus } from '../utils/riskScoreUtils';

const PatientDetail = () => {
  const { patientId } = useParams();
  const { getPatientById, getPatientPriorityInfo, loading, error } = usePatients();
  const { getPatientAlerts, acknowledgeAlert } = useAlerts();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Generate dummy data for vital signs chart
  const [vitalSigns, setVitalSigns] = useState([]);
  
  useEffect(() => {
    // Simulate loading vital signs data
    const generateVitalSignsData = () => {
      const now = new Date();
      const data = [];
      
      // Generate 24 hours of data points (one per hour)
      for (let i = 23; i >= 0; i--) {
        const timePoint = new Date(now);
        timePoint.setHours(now.getHours() - i);
        
        data.push({
          time: timePoint.toISOString(),
          hr: Math.floor(70 + Math.random() * 40), // 70-110
          bp: Math.floor(110 + Math.random() * 40), // 110-150
          rr: Math.floor(12 + Math.random() * 10), // 12-22
          o2: Math.floor(90 + Math.random() * 10), // 90-100
          temp: (36 + Math.random() * 2).toFixed(1) // 36-38°C
        });
      }
      
      setVitalSigns(data);
    };
    
    generateVitalSignsData();
  }, [patientId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        Error: {error}
      </div>
    );
  }
  
  const patient = getPatientById(patientId);
  const priorityInfo = getPatientPriorityInfo(patientId);
  const alerts = getPatientAlerts(patientId);
  
  if (!patient) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        Patient not found. <Link to="/" className="underline">Return to dashboard</Link>
      </div>
    );
  }
  
  // Tab components
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Patient Information">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Patient ID</h4>
              <p className="mt-1 text-lg">{patient.patientId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-lg">{patient.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Primary Diagnosis</h4>
              <p className="mt-1 text-lg">{patient.diagnosis}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Room/Bed</h4>
              <p className="mt-1 text-lg">{patient.room}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
              <p className="mt-1 text-sm">{formatDateTime(patient.lastUpdate)} ({formatTimeSince(patient.lastUpdate)})</p>
            </div>
          </div>
        </Card>
        
        <Card title="Sepsis Risk Assessment">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative mb-8">
              <svg className="w-40 h-40" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke={
                    patient.sepsisScore >= 80 ? '#ef4444' :
                    patient.sepsisScore >= 60 ? '#f59e0b' : '#10b981'
                  } 
                  strokeWidth="12" 
                  strokeDasharray={`${(patient.sepsisScore / 100) * 339} 339`}
                  strokeDashoffset={339 * 0.25}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="65" dominantBaseline="middle" textAnchor="middle" fontSize="24" fontWeight="bold">
                  {patient.sepsisScore}%
                </text>
              </svg>
            </div>
            <div className="text-center">
              <StatusBadge status={getSepsisRiskLabel(patient.sepsisScore)} size="lg" />
              <p className="mt-2 text-sm text-gray-500">
                Based on vital signs and laboratory values
              </p>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="Recent Vital Signs Trends">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalSigns}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => [value, name === 'hr' ? 'Heart Rate' : 
                                             name === 'bp' ? 'Blood Pressure' : 
                                             name === 'rr' ? 'Respiratory Rate' : 
                                             name === 'o2' ? 'O2 Saturation' : 'Temperature']}
                labelFormatter={(time) => new Date(time).toLocaleString()}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="hr" stroke="#ef4444" name="Heart Rate" />
              <Line yAxisId="left" type="monotone" dataKey="bp" stroke="#3b82f6" name="Blood Pressure" />
              <Line yAxisId="left" type="monotone" dataKey="rr" stroke="#10b981" name="Respiratory Rate" />
              <Line yAxisId="right" type="monotone" dataKey="o2" stroke="#8b5cf6" name="O2 Saturation" />
              <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#f59e0b" name="Temperature" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      <Card title="Current Vital Signs" contentClassName="p-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 divide-x divide-y">
          {vitalSigns.length > 0 && (
            <>
              <VitalSignCard 
                name="Heart Rate" 
                value={vitalSigns[vitalSigns.length - 1].hr} 
                unit="bpm" 
                status={getVitalStatus('hr', vitalSigns[vitalSigns.length - 1].hr)}
              />
              <VitalSignCard 
                name="Blood Pressure" 
                value={vitalSigns[vitalSigns.length - 1].bp} 
                unit="mmHg" 
                status={getVitalStatus('bp', vitalSigns[vitalSigns.length - 1].bp)}
              />
              <VitalSignCard 
                name="Respiratory Rate" 
                value={vitalSigns[vitalSigns.length - 1].rr} 
                unit="bpm" 
                status={getVitalStatus('rr', vitalSigns[vitalSigns.length - 1].rr)}
              />
              <VitalSignCard 
                name="O2 Saturation" 
                value={vitalSigns[vitalSigns.length - 1].o2} 
                unit="%" 
                status={getVitalStatus('o2', vitalSigns[vitalSigns.length - 1].o2)}
              />
              <VitalSignCard 
                name="Temperature" 
                value={vitalSigns[vitalSigns.length - 1].temp} 
                unit="°C" 
                status={getVitalStatus('temp', parseFloat(vitalSigns[vitalSigns.length - 1].temp))}
              />
            </>
          )}
        </div>
      </Card>
    </div>
  );
  
  const renderAlertsTab = () => (
    <Card title="Patient Alerts" contentClassName="p-0">
      {alerts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No alerts for this patient
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {alerts.map((alert) => (
            <li 
              key={`${alert.patientId}-${alert.time}`}
              className="p-4 hover:bg-gray-50 flex items-start justify-between"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <StatusBadge 
                    status={alert.type === 'Sepsis risk > 80%' || alert.type === 'HR critical' ? 'critical' : 'warning'} 
                    size="sm" 
                  />
                  <h4 className="font-medium">{alert.type}</h4>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {formatDateTime(alert.time)} ({formatTimeSince(alert.time)})
                </p>
              </div>
              <button
                onClick={() => acknowledgeAlert(alert.patientId + alert.time)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                Acknowledge
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
  
  const renderLabsTab = () => (
    <Card title="Laboratory Results">
      <div className="text-center text-gray-500 py-8">
        Lab results functionality coming soon
      </div>
    </Card>
  );
  
  const renderTreatmentsTab = () => (
    <Card title="Treatments & Medications">
      <div className="text-center text-gray-500 py-8">
        Treatments and medications functionality coming soon
      </div>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <div className="flex items-center space-x-4 mt-1">
              <div className="text-sm text-gray-500">ID: {patient.patientId}</div>
              <div className="text-sm text-gray-500">{patient.room}</div>
              <StatusBadge status={patient.sepsisScore} />
            </div>
          </div>
          
          <div className="flex space-x-2">
            {priorityInfo && priorityInfo.unacknowledgedAlerts > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                {priorityInfo.unacknowledgedAlerts} unacknowledged alerts
              </span>
            )}
            <button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts {alerts.length > 0 && `(${alerts.length})`}
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'labs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lab Results
            </button>
            <button
              onClick={() => setActiveTab('treatments')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'treatments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Treatments
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'alerts' && renderAlertsTab()}
          {activeTab === 'labs' && renderLabsTab()}
          {activeTab === 'treatments' && renderTreatmentsTab()}
        </div>
      </div>
    </div>
  );
};

// Helper component for vital signs
const VitalSignCard = ({ name, value, unit, status }) => {
  return (
    <div className="p-4 text-center">
      <h4 className="text-sm font-medium text-gray-500">{name}</h4>
      <div className="mt-2 flex justify-center items-center">
        <span className={`text-2xl font-bold ${
          status === 'critical' ? 'text-red-600' :
          status === 'warning' ? 'text-yellow-600' :
          'text-green-600'
        }`}>
          {value}
        </span>
        <span className="ml-1 text-sm text-gray-500">{unit}</span>
      </div>
      <div className="mt-1">
        <StatusBadge status={status} size="sm" />
      </div>
    </div>
  );
};

export default PatientDetail;