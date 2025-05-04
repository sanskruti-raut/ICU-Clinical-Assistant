import axios from 'axios';

// Set up base URL for API calls
const api = axios.create({
  baseURL: '/api',
});

export const fetchPriorityPatients = async () => {
  try {
    const response = await api.get('/priority-patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching priority patients:', error);
    return [];
  }
};

export const fetchPatientOverview = async (patientId) => {
  try {
    const response = await api.get(`/patient-overview/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching patient ${patientId} overview:`, error);
    return null;
  }
};

export const fetchVitals = async (patientId) => {
  try {
    const response = await api.get(`/vitals/stream/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vitals for patient ${patientId}:`, error);
    return null;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return {};
  }
};

export const fetchAnalyticsSummary = async () => {
  try {
    const response = await api.get('/analytics-summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }
};
