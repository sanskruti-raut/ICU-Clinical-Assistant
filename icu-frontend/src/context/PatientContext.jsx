import React, { createContext, useContext, useState, useEffect } from 'react';
import { getPatients, getPriorityPatients } from '../api/apiService';

const PatientContext = createContext();

export const usePatients = () => useContext(PatientContext);

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [priorityPatients, setPriorityPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all patients data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both regular patients and priority patients
        const [patientsData, priorityData] = await Promise.all([
          getPatients(),
          getPriorityPatients()
        ]);
        
        setPatients(patientsData);
        setPriorityPatients(priorityData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patient data');
        setLoading(false);
        console.error('Error loading patients:', err);
      }
    };
    
    fetchData();
    
    // Set up polling for fresh data (every 30 seconds)
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Get a single patient by ID
  const getPatientById = (patientId) => {
    return patients.find(p => p.patientId === patientId) || null;
  };

  // Get high risk patients (sepsis score >= 70)
  const getHighRiskPatients = () => {
    return patients
      .filter(p => p.sepsisScore >= 70)
      .sort((a, b) => b.sepsisScore - a.sepsisScore);
  };

  // Format the time since last update
  const formatTimeSince = (timestamp) => {
    const updateTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - updateTime;
    
    // Convert to minutes
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return `${hours}h ${mins}m ago`;
    }
  };

  // Get a patient's priority info
  const getPatientPriorityInfo = (patientId) => {
    return priorityPatients.find(p => p.patientId === patientId) || null;
  };

  // Value to be provided to consumers
  const value = {
    patients,
    priorityPatients,
    loading,
    error,
    getPatientById,
    getHighRiskPatients,
    formatTimeSince,
    getPatientPriorityInfo
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;