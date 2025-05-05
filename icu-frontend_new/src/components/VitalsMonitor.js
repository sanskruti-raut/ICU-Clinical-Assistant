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

  // Initialize with vitalsHistory when it changes
  useEffect(() => {
    if (vitalsHistory && vitalsHistory.length > 0) {
      setAllVitals(vitalsHistory);
    }
  }, [vitalsHistory]);

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
          backgroundColor: color + '20',
          tension: 0.3,
          pointBackgroundColor: vitalsByLabel[label].map(v => 
            getVitalStatus(v.label, v.valuenum) === 'warning' ? '#ff9800' :
            getVitalStatus(v.label, v.valuenum) === 'danger' ? '#f44336' : color
          ),
          pointRadius: 5,
          pointHoverRadius: 7
        };
      });

      const timeLabels = allVitals
        .map(v => new Date(v.charttime))
        .filter((value, index, self) => 
          index === self.findIndex(t => 
            t.getTime() === value.getTime()
          )
        )
        .sort((a, b) => a - b)
        .map(date => {
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        });

      setChartData({
        labels: timeLabels.length > 0 ? timeLabels : Array(allVitals.length).fill('').map((_, i) => `Point ${i+1}`),
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
      'SpO2': '#795548',
      'Non Invasive Blood Pressure systolic': '#ff9800',
      'Non Invasive Blood Pressure diastolic': '#9c27b0',
      'Non Invasive Blood Pressure mean': '#7e57c2',
      'Temperature Fahrenheit': '#4caf50'
    };
    return colors[label] || '#607d8b'; // Default color
  };

  // Get icon for vital
  const getVitalIcon = (label) => {
    if (label.includes('Heart Rate')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
        </svg>
      );
    } else if (label.includes('Pressure')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="8 12 12 16 16 12"></polyline>
          <line x1="12" y1="8" x2="12" y2="16"></line>
        </svg>
      );
    } else if (label.includes('Temperature')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
      );
    }
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
      case 'Non Invasive Blood Pressure systolic':
        return value > 140 ? 'warning' : value < 90 ? 'danger' : 'normal';
      case 'Diastolic BP':
      case 'Non Invasive Blood Pressure diastolic':
        return value > 90 ? 'warning' : value < 60 ? 'danger' : 'normal';
      case 'Temperature':
      case 'Temperature Fahrenheit':
        return value > 99 ? 'warning' : value < 97 ? 'danger' : 'normal';
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

  // Get normal range description
  const getNormalRange = (label) => {
    switch (label) {
      case 'Heart Rate':
        return '60-100 bpm';
      case 'Respiratory Rate':
        return '12-20 rpm';
      case 'Systolic BP':
      case 'Non Invasive Blood Pressure systolic':
        return '90-140 mmHg';
      case 'Diastolic BP':
      case 'Non Invasive Blood Pressure diastolic':
        return '60-90 mmHg';
      case 'Temperature Fahrenheit':
        return '97-99°F';
      case 'SpO2':
        return '≥ 95%';
      default:
        return '';
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        Vitals Monitor
      </h2>

      <div className="vitals-container">
        {getLatestVitals().map(vital => {
          const status = getVitalStatus(vital.label, vital.valuenum);
          return (
            <div className={`vital-box vital-status-${status}`} key={vital.label}>
              <div className="vital-icon">
                {getVitalIcon(vital.label)}
              </div>
              <div className="vital-label">{vital.label}</div>
              <div className={`vital-value vital-${status}`}>
                {vital.valuenum}
              </div>
              <div className="vital-range">{getNormalRange(vital.label)}</div>
            </div>
          );
        })}
      </div>

      {chartData && (
        <div className="chart-container">
          <h3 className="chart-title">Vitals Trend</h3>
          <div style={{ height: '300px' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                  duration: 1000
                },
                interaction: {
                  mode: 'index',
                  intersect: false
                },
                scales: {
                  y: {
                    beginAtZero: false,
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                      display: true,
                      text: 'Value'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    },
                    title: {
                      display: true,
                      text: 'Time'
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    titleFont: {
                      size: 14
                    },
                    bodyFont: {
                      size: 13
                    },
                    cornerRadius: 6
                  },
                  legend: {
                    labels: {
                      boxWidth: 12,
                      usePointStyle: true,
                      padding: 20
                    },
                    position: 'top'
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      <div className="vitals-history">
        <h3 className="history-title">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Recent Vitals History
        </h3>
        {vitalsHistory && vitalsHistory.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Vital Sign</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vitalsHistory.map((vital, index) => {
                  const status = getVitalStatus(vital.label, vital.valuenum);
                  return (
                    <tr key={index}>
                      <td>{new Date(vital.charttime).toLocaleString()}</td>
                      <td>
                        <div className="vital-table-label">
                          <span className="vital-table-icon" style={{ color: getColorForVital(vital.label) }}>
                            {getVitalIcon(vital.label)}
                          </span>
                          {vital.label}
                        </div>
                      </td>
                      <td>{vital.valuenum}</td>
                      <td>
                        <span className={`status-badge status-${status}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <p>No vitals history available.</p>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .vitals-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .vital-box {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 15px;
          min-width: 150px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
          border-top: 4px solid #ddd;
        }
        .vital-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        .vital-status-normal {
          border-top-color: #4caf50;
        }
        .vital-status-warning {
          border-top-color: #ff9800;
        }
        .vital-status-danger {
          border-top-color: #f44336;
        }
        .vital-icon {
          margin-bottom: 10px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
        }
        .vital-status-normal .vital-icon {
          background-color: #e8f5e9;
          color: #4caf50;
        }
        .vital-status-warning .vital-icon {
          background-color: #fff8e1;
          color: #ff9800;
        }
        .vital-status-danger .vital-icon {
          background-color: #ffebee;
          color: #f44336;
        }
        .vital-value {
          font-size: 2rem;
          font-weight: 700;
          margin: 8px 0;
        }
        .vital-label {
          font-size: 0.85rem;
          color: #666;
          text-align: center;
          margin-bottom: 5px;
        }
        .vital-range {
          font-size: 0.75rem;
          color: #888;
          margin-top: 5px;
        }
        .vital-normal {
          color: #4caf50;
        }
        .vital-warning {
          color: #ff9800;
        }
        .vital-danger {
          color: #f44336;
        }
        .chart-container {
          background-color: #fff;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .chart-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 15px;
          color: #333;
        }
        .vitals-history {
          margin-top: 20px;
        }
        .history-title {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 15px;
          color: #1976d2;
          display: flex;
          align-items: center;
        }
        .table-container {
          max-height: 300px;
          overflow-y: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .vital-table-label {
          display: flex;
          align-items: center;
        }
        .vital-table-icon {
          margin-right: 8px;
          display: inline-flex;
          align-items: center;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .status-normal {
          background-color: #e8f5e9;
          color: #4caf50;
        }
        .status-warning {
          background-color: #fff8e1;
          color: #ff9800;
        }
        .status-danger {
          background-color: #ffebee;
          color: #f44336;
        }
        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #9e9e9e;
          text-align: center;
        }
        .no-data p {
          margin-top: 15px;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default VitalsMonitor;
