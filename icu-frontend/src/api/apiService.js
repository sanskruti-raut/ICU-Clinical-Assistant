import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Patient-related API calls
export const getPatients = async () => {
  try {
    const response = await apiClient.get('/patients/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

// Alert-related API calls
export const getRecentAlerts = async () => {
  try {
    const response = await apiClient.get('/alerts/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

// Dashboard stats API calls
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Priority patients API calls
export const getPriorityPatients = async () => {
  try {
    const response = await apiClient.get('/priority/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching priority patients:', error);
    throw error;
  }
};

export default {
  getPatients,
  getRecentAlerts,
  getDashboardStats,
  getPriorityPatients,
};