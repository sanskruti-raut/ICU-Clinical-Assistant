import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePatients } from '../../context/PatientContext';

const PatientGrid = () => {
  const { patients, loading, error, formatTimeSince } = usePatients();
  const [sortField, setSortField] = useState('sepsisScore');
  const [sortDirection, setSortDirection] = useState('desc');

  if (loading) {
    return (
      <Card title="ICU Patient Overview">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="ICU Patient Overview">
        <div className="text-red-500 p-4">{error}</div>
      </Card>
    );
  }

  // Handle sort
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorted patients
  const getSortedPatients = () => {
    return [...patients].sort((a, b) => {
      let valueA = a[sortField];
      let valueB = b[sortField];
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      // Sort direction
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
  };

  // Sort indicator
  const SortIndicator = ({ field }) => {
    if (field !== sortField) return null;
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  // Handle quick view button click
  const handleQuickView = (patientId) => {
    console.log(`Quick view for patient ${patientId}`);
    // Implement quick view functionality here
  };

  return (
    <Card 
      title="ICU Patient Overview"
      titleClassName="text-lg"
      contentClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('patientId')}
              >
                Patient ID <SortIndicator field="patientId" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('diagnosis')}
              >
                Primary Diagnosis <SortIndicator field="diagnosis" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('room')}
              >
                Room/Bed <SortIndicator field="room" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('sepsisScore')}
              >
                Sepsis Risk <SortIndicator field="sepsisScore" />
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastUpdate')}
              >
                Last Updated <SortIndicator field="lastUpdate" />
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getSortedPatients().map((patient) => (
              <tr key={patient.patientId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {patient.patientId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {patient.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{patient.diagnosis}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{patient.room}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={patient.sepsisScore} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimeSince(patient.lastUpdate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleQuickView(patient.patientId)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Quick View
                  </button>
                  <Link
                    to={`/patient/${patient.patientId}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default PatientGrid;