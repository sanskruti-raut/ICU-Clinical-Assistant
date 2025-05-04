import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function VitalsMonitor({ currentVital, vitalsHistory }) {
  const [chartData, setChartData] = useState(null);
  const [allVitals, setAllVitals] = useState([]);

  // Update all vitals when currentVital changes
  useEffect(() => {
    if (currentVital && currentVital.valuenum) {
      // Add new vital to the list, keeping only the last 10
      setAllVitals(prev => {
        const newVitals = [...prev, currentVital].slice(-10);
        return newVitals;
      });
    }
  }, [currentVital]);

  // Prepare chart data when vitals change
  useEffect(() => {
    if (allVitals.length > 0) {
      // Group vitals by label
      const vitalsByLabel = allVitals.reduce((acc, vital) => {
        if (!acc[vital.label]) {
          acc[vital.label] = [];
        }
        acc[vital.label].push(vital);
        return acc;
      }, {});
      
      // Prepare datasets for chart
      const datasets = Object.keys(vitalsByLabel).map((label, index) => {
        const color = getColorForVital(label);
        return {
          label,
          data: vitalsByLabel[label].map(v => v.valuenum),
          borderColor: color,
          backgroundColor: `${color}20`,
          tension: 0.3
        };
      });
      
      setChartData({
        labels: Array(allVitals.length).fill('').map((_, i) => i + 1),
        datasets
      });
    }
  }, [allVitals]);

  // Define color scheme for vital signs
  const getColorForVital = (label) => {
    const colors = {
      'Heart Rate': '#f44336',
      'Respiratory Rate': '#2196f3',
      'Systolic BP': '#ff9800',
      'Diastolic BP': '#9c27b0',
      'Temperature': '#4caf50',
      'SpO2': '#795548'
    };
    return colors[label] || '#607d8b'; // Default color
  };

  // Check if a vital sign is outside normal range
  const getVitalStatus = (label, value) => {
    if (!value) return 'normal';
    
    switch (label) {
      case 'Heart Rate':
        return value < 60 || value > 100 ? 'warning' : 'normal';
      case 'Respiratory Rate':
        return value < 12 || value > 20 ? 'warning' : 'normal';
      case 'Systolic BP':
        return value > 140 ? 'warning' : value < 90 ? 'danger' : 'normal';
      case 'Diastolic BP':
        return value > 90 ? 'warning' : value < 60 ? 'danger' : 'normal';
      case 'Temperature':
        return value > 38 ? 'warning' : value < 36 ? 'danger' : 'normal';
      case 'SpO2':
        return value < 95 ? 'danger' : 'normal';
      default:
        return 'normal';
    }
  };

  // Get the latest value for each vital sign
  const getLatestVitals = () => {
    if (allVitals.length === 0) return [];
    
    const latestByLabel = {};
    allVitals.forEach(vital => {
      if (!latestByLabel[vital.label] || 
          new Date(vital.charttime) > new Date(latestByLabel[vital.label].charttime)) {
        latestByLabel[vital.label] = vital;
      }
    });
    
    return Object.values(latestByLabel);
  };

  return (
    <div className="card">
      <h2 className="card-title">Vitals Monitor</h2>
      
      <div className="vitals-container">
        {getLatestVitals().map(vital => (
          <div className="vital-box" key={vital.label}>
            <div className="vital-label">{vital.label}</div>
            <div className={`vital-value vital-${getVitalStatus(vital.label, vital.valuenum)}`}>
              {vital.valuenum}
            </div>
          </div>
        ))}
      </div>
      
      {chartData && (
        <div className="chart-container" style={{ marginTop: '20px', height: '300px' }}>
          <Line 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: false
                }
              }
            }}
          />
        </div>
      )}
      
      <div className="vitals-history" style={{ marginTop: '20px' }}>
        <h3>Recent Vitals History</h3>
        {vitalsHistory.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Vital Sign</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {vitalsHistory.map((vital, index) => (
                <tr key={index}>
                  <td>{new Date(vital.charttime).toLocaleString()}</td>
                  <td>{vital.label}</td>
                  <td className={`vital-${getVitalStatus(vital.label, vital.valuenum)}`}>
                    {vital.valuenum}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vitals history available.</p>
        )}
      </div>
    </div>
  );
}

export default VitalsMonitor;
