import axios from 'axios';

// Set up base URL for API calls
const api = axios.create({
  baseURL: '/api',
});

// Add request interceptor to include token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // If 401 Unauthorized, redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Add more context to the error
    if (error.response) {
      error.message = `Server responded with error ${error.response.status}: ${error.response.data.error || error.message}`;
    } else if (error.request) {
      error.message = 'No response received from server. Please check your network connection.';
    }
    return Promise.reject(error);
  }
);

// Cache for sepsis scores to avoid redundant API calls
const sepsisScoreCache = new Map();

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

export const fetchPatientSepsisScore = async (patientId, forceRefresh = false) => {
  // Check cache first unless forceRefresh is true
  if (!forceRefresh && sepsisScoreCache.has(patientId)) {
    const cachedData = sepsisScoreCache.get(patientId);
    // Check if cache is still valid (less than 5 minutes old)
    if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
      console.log(`Using cached sepsis score for patient ${patientId}`);
      return cachedData.data;
    }
  }

  try {
    // Add a timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await api.get(`/score/${patientId}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Cache the response
    sepsisScoreCache.set(patientId, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      throw new Error(`Timeout while fetching sepsis score for patient ${patientId}`);
    }
    // If there's an error, still return a structured response
    console.error(`Error fetching sepsis score for patient ${patientId}:`, error);
    throw error;
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return { alerts: [] };
  }
};

export const fetchSepsisAlerts = async () => {
  try {
    const response = await api.get('/sepsis-alerts');
    return response.data;
  } catch (error) {
    console.error('Error fetching sepsis alerts:', error);
    return [];
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

export const deletePatient = async (patientId) => {
  try {
    const response = await api.delete(`/delete-patient/${patientId}`);
    // Also remove from cache
    sepsisScoreCache.delete(patientId);
    return response.data;
  } catch (error) {
    console.error(`Error deleting patient ${patientId}:`, error);
    throw error;
  }
};

export const refreshSepsisScores = async (patientIds) => {
  if (!patientIds || patientIds.length === 0) return [];

  console.log(`Refreshing sepsis scores for ${patientIds.length} patients`);

  const results = await Promise.allSettled(
    patientIds.map(id => fetchPatientSepsisScore(id, true))
  );

  return results.map((result, index) => ({
    patientId: patientIds[index],
    success: result.status === 'fulfilled',
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
};

export const searchPatientById = async (patientId) => {
  try {
    // First check if the patient exists in the priority patients
    const response = await api.get(`/patient-overview/${patientId}`);
    return response.data;
  } catch (error) {
    console.error(`Error searching for patient ${patientId}:`, error);
    throw new Error(`Patient with ID ${patientId} not found`);
  }
};
