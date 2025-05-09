import React, { useState, useEffect } from 'react';
import PatientList from './PatientList';
import AlertsPanel from './AlertsPanel';
import SepsisAlerts from './SepsisAlerts';
import AnalyticsSummary from './AnalyticsSummary';
import { 
  fetchPriorityPatients, 
  fetchAlerts, 
  fetchAnalyticsSummary,
  fetchSepsisAlerts
} from '../utils/api';

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState({ alerts: [] });
  const [sepsisAlerts, setSepsisAlerts] = useState([]);
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
        
        // Initial sepsis alerts load
        const sepsisAlertsData = await fetchSepsisAlerts();
        if (sepsisAlertsData && Array.isArray(sepsisAlertsData)) {
          setSepsisAlerts(sepsisAlertsData);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
      setLoading(false);
    };

    loadDashboardData();

    // Set up polling for regular alerts
    const alertsInterval = setInterval(async () => {
      try {
        const alertsData = await fetchAlerts();
        if (alertsData.alerts) {
          setAlerts(alertsData);
        }
      } catch (error) {
        console.error('Error polling alerts:', error);
      }
    }, 5000);
    
    // Set up polling for sepsis alerts
    const sepsisAlertsInterval = setInterval(async () => {
      try {
        const sepsisAlertsData = await fetchSepsisAlerts();
        if (sepsisAlertsData && Array.isArray(sepsisAlertsData)) {
          setSepsisAlerts(sepsisAlertsData);
        }
      } catch (error) {
        console.error('Error polling sepsis alerts:', error);
      }
    }, 7000); // Slightly different interval to avoid simultaneous requests

    // Clean up intervals on component unmount
    return () => {
      clearInterval(alertsInterval);
      clearInterval(sepsisAlertsInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
        <style jsx="true">{`
          .loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            width: 36px;
            height: 36px;
            border-radius: 50%;
            border-left-color: #1976d2;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-layout">
        {/* Top row with analytics */}
        <div className="analytics-section">
          <AnalyticsSummary analytics={analytics} />
        </div>
        
        {/* Middle row with alerts and patients list */}
        <div className="main-content">
          <div className="alerts-column">
            <AlertsPanel alerts={alerts} />
            <SepsisAlerts alerts={sepsisAlerts} />
          </div>
          <div className="patients-column">
            <PatientList patients={patients} />
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        .dashboard-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .analytics-section {
          width: 100%;
        }
        
        .main-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .alerts-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        /* For tablets and larger */
        @media (min-width: 768px) {
          .main-content {
            flex-direction: row;
          }
          
          .alerts-column {
            width: 40%;
            flex-shrink: 0;
          }
          
          .patients-column {
            flex-grow: 1;
          }
        }
        
        /* For larger screens */
        @media (min-width: 1200px) {
          .alerts-column {
            width: 30%;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
