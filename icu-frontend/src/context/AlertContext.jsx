import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRecentAlerts } from '../api/apiService';

const AlertContext = createContext();

export const useAlerts = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [lastAlertTimestamp, setLastAlertTimestamp] = useState(null);

  // Fetch alerts data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const alertsData = await getRecentAlerts();
        
        // Sort alerts by time (newest first)
        const sortedAlerts = [...alertsData].sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );
        
        setAlerts(sortedAlerts);
        
        // Check for new alerts if we have a previous timestamp
        if (sortedAlerts.length > 0) {
          const mostRecent = new Date(sortedAlerts[0].time);
          
          if (lastAlertTimestamp && mostRecent > lastAlertTimestamp) {
            // Count new alerts that haven't been acknowledged
            const newAlerts = sortedAlerts.filter(
              alert => new Date(alert.time) > lastAlertTimestamp && 
                      !acknowledgedAlerts.has(alert.patientId + alert.time)
            );
            
            setNewAlertCount(prev => prev + newAlerts.length);
          }
          
          setLastAlertTimestamp(mostRecent);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts');
        setLoading(false);
        console.error('Error loading alerts:', err);
      }
    };
    
    fetchData();
    
    // Poll for new alerts (every 15 seconds)
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    
    return () => clearInterval(interval);
  }, [lastAlertTimestamp, acknowledgedAlerts]);

  // Acknowledge an alert
  const acknowledgeAlert = (alertId) => {
    setAcknowledgedAlerts(prev => {
      const updated = new Set(prev);
      updated.add(alertId);
      return updated;
    });
  };

  // Reset new alert counter
  const resetNewAlertCount = () => {
    setNewAlertCount(0);
  };

  // Get alerts for a specific patient
  const getPatientAlerts = (patientId) => {
    return alerts.filter(alert => alert.patientId === patientId);
  };

  // Format time since alert was generated
  const formatTimeSince = (timestamp) => {
    const alertTime = new Date(timestamp);
    const now = new Date();
    const diffMs = now - alertTime;
    
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

  // Get unacknowledged alerts
  const getUnacknowledgedAlerts = () => {
    return alerts.filter(alert => 
      !acknowledgedAlerts.has(alert.patientId + alert.time)
    );
  };

  // Value to be provided to consumers
  const value = {
    alerts,
    loading,
    error,
    acknowledgeAlert,
    resetNewAlertCount,
    newAlertCount,
    getPatientAlerts,
    formatTimeSince,
    getUnacknowledgedAlerts
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export default AlertContext;