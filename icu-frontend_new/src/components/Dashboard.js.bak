import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import AlertsPanel from './AlertsPanel';
import AnalyticsSummary from './AnalyticsSummary';
import { fetchPriorityPatients, fetchAlerts, fetchAnalyticsSummary } from '../utils/api';

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState({ alerts: [] });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load patients
        const patientsData = await fetchPriorityPatients();
        setPatients(patientsData);

        // Load analytics
        const analyticsData = await fetchAnalyticsSummary();
        setAnalytics(analyticsData);
        
        // Initial alerts load
        const alertsData = await fetchAlerts();
        if (alertsData.alerts) {
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      setLoading(false);
    };

    loadDashboardData();

    // Set up polling for alerts
    const alertsInterval = setInterval(async () => {
      const alertsData = await fetchAlerts();
      if (alertsData.alerts) {
        setAlerts(alertsData);
      }
    }, 5000);

    return () => clearInterval(alertsInterval);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="grid grid-2">
        <div>
          <AnalyticsSummary analytics={analytics} />
          <AlertsPanel alerts={alerts} />
        </div>
        <PatientList patients={patients} />
      </div>
    </div>
  );
}

export default Dashboard;
