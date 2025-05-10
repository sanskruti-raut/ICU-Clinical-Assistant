import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchPatientSepsisScore, deletePatient } from '../utils/api';
import PatientSearch from './PatientSearch';

function PatientList({ patients }) {
  const [patientsWithScores, setPatientsWithScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayedPatients, setDisplayedPatients] = useState([]);

  useEffect(() => {
    const loadSepsisScores = async () => {
      if (!patients || patients.length === 0) {
        setPatientsWithScores([]);
        setDisplayedPatients([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Create an array of promises to fetch sepsis scores for all patients
        const scoresPromises = patients.map(async (patient) => {
          try {
            // Use the utility function from api.js that handles the correct endpoint
            const response = await fetchPatientSepsisScore(patient.id);
            console.log(`Score for patient ${patient.id}:`, response);
            return {
              ...patient,
              sepsisScore: response.risk_score !== null && response.risk_score !== undefined ?
                response.risk_score : 'N/A',
              scoreNote: response.note || null
            };
          } catch (error) {
            console.error(`Error fetching score for patient ${patient.id}:`, error);
            return {
              ...patient,
              sepsisScore: 'Error',
              scoreNote: error.message || 'Failed to fetch score'
            };
          }
        });

        // Wait for all promises to resolve
        const patientsData = await Promise.all(scoresPromises);
        console.log("Patients with scores:", patientsData);
        setPatientsWithScores(patientsData);
        setDisplayedPatients(patientsData);
      } catch (error) {
        console.error("Error loading sepsis scores:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSepsisScores();
  }, [patients]);

  // Handle patient found from search
  const handlePatientFound = async (patient) => {
    // Check if patient is already in the displayed list
    const patientExists = displayedPatients.some(p => p.id === patient.id);
    
    if (!patientExists) {
      try {
        // Fetch sepsis score for the new patient
        const response = await fetchPatientSepsisScore(patient.id);
        
        const patientWithScore = {
          ...patient,
          sepsisScore: response.risk_score !== null && response.risk_score !== undefined ?
            response.risk_score : 'N/A',
          scoreNote: response.note || null
        };
        
        // Add the patient to the top of the displayed list
        setDisplayedPatients(prevPatients => [patientWithScore, ...prevPatients]);
        
        // Also update the main patients list
        setPatientsWithScores(prevPatients => [patientWithScore, ...prevPatients]);
      } catch (error) {
        console.error(`Error fetching score for patient ${patient.id}:`, error);
        
        const patientWithError = {
          ...patient,
          sepsisScore: 'Error',
          scoreNote: error.message || 'Failed to fetch score'
        };
        
        setDisplayedPatients(prevPatients => [patientWithError, ...prevPatients]);
        setPatientsWithScores(prevPatients => [patientWithError, ...prevPatients]);
      }
    } else {
      // If patient already exists, highlight it
      console.log(`Patient ${patient.id} already in the list`);
      
      // Scroll to the patient in the list
      const patientElement = document.getElementById(`patient-${patient.id}`);
      if (patientElement) {
        patientElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a temporary highlight effect
        patientElement.classList.add('highlight-row');
        setTimeout(() => {
          patientElement.classList.remove('highlight-row');
        }, 2000);
      }
    }
  };

  // Handle patient deletion
  const handleDeletePatient = async (patientId) => {
    const confirmDelete = window.confirm('Do you confirm you want to delete this patient?');
    
    if (confirmDelete) {
      try {
        // Call API to delete patient
        await deletePatient(patientId);
        
        // Remove patient from local state
        setDisplayedPatients(prevPatients => 
          prevPatients.filter(patient => patient.id !== patientId)
        );
        setPatientsWithScores(prevPatients => 
          prevPatients.filter(patient => patient.id !== patientId)
        );
        
        // Show success message (optional)
        console.log(`Patient ${patientId} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting patient ${patientId}:`, error);
        alert('Failed to delete patient. Please try again.');
      }
    }
  };

  // Function to truncate text with read more link
  const truncateDiseases = (diseases, maxLength = 100) => {
    if (!diseases) return 'None specified';
    if (diseases.length <= maxLength) return diseases;

    // Split by commas and take first 3 conditions
    const diseaseArray = diseases.split(',');
    if (diseaseArray.length <= 3) {
      return diseases.substring(0, maxLength) + '...';
    }

    return diseaseArray.slice(0, 3).join(',') +
      ` <span class="read-more"
        title="${diseases}"
        style="color: #1976d2; cursor: pointer; font-weight: 500; text-decoration: underline;">
        +${diseaseArray.length - 3} more...
      </span>`;
  };

  // Memoize the color calculation function to improve performance
  const getSepsisScoreColor = useMemo(() => (score) => {
    if (score === 'N/A' || score === 'Error') return '#888';

    // Convert score to number if it's a string
    const numScore = typeof score === 'string' ? parseFloat(score) : score;

    if (numScore < 0.3) return '#4caf50';  // Low risk - green
    if (numScore < 0.6) return '#ff9800';  // Medium risk - orange
    return '#f44336';  // High risk - red
  }, []);

  // Function to format sepsis score display
  const formatSepsisScore = (score) => {
    if (score === 'N/A' || score === 'Error') return score;

    // Format number to percentage with 1 decimal place
    return `${(parseFloat(score) * 100).toFixed(1)}%`;
  };

  // Function to get risk label
  const getRiskLabel = (score) => {
    if (score === 'N/A' || score === 'Error') return '';
    
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    
    if (numScore < 0.3) return 'Low';
    if (numScore < 0.6) return 'Medium';
    return 'High';
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          <path d="M9 14l2 2 4-4"></path>
        </svg>
        Priority Patients
      </h2>

      <PatientSearch onPatientFound={handlePatientFound} />

      {loading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading patient data...</p>
        </div>
      ) : displayedPatients.length === 0 ? (
        <p>No priority patients found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>ID</th>
                <th style={{ width: '8%' }}>Age</th>
                <th style={{ width: '8%' }}>Gender</th>
                <th style={{ width: '32%' }}>Primary Conditions</th>
                <th style={{ width: '18%', textAlign: 'center' }}>Sepsis Risk</th>
                <th style={{ width: '22%', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedPatients.map((patient) => (
                <tr key={patient.id} id={`patient-${patient.id}`} className={patient.sepsisScore > 0.7 ? 'high-risk-row' : ''}>
                  <td>
                    <span className="patient-id">{patient.id}</span>
                  </td>
                  <td>
                    <div className="age-badge">{patient.age}</div>
                  </td>
                  <td>
                    <div className={`gender-icon ${patient.gender === 'F' ? 'female' : 'male'}`}>
                      {patient.gender === 'F' ? '♀' : '♂'}
                    </div>
                  </td>
                  <td dangerouslySetInnerHTML={{ __html: truncateDiseases(patient.diseases) }}></td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="sepsis-score-container">
                      <div
                        className={`sepsis-score ${patient.sepsisScore === 'Error' ? 'error' : ''}`}
                        style={{
                          backgroundColor: getSepsisScoreColor(patient.sepsisScore) + '20',
                          color: getSepsisScoreColor(patient.sepsisScore)
                        }}
                        title={patient.scoreNote || ''}
                      >
                        {formatSepsisScore(patient.sepsisScore)}
                        {patient.sepsisScore !== 'N/A' && patient.sepsisScore !== 'Error' && (
                          <span className="risk-label">
                            {getRiskLabel(patient.sepsisScore)} Risk
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div className="action-buttons">
                      <Link to={`/patient/${patient.id}`}>
                        <button className="btn btn-primary btn-small">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          View
                        </button>
                      </Link>
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeletePatient(patient.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '3px' }}>
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx="true">{`
        .table-responsive {
          overflow-x: auto;
        }
        .table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .table th, .table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        .table th {
          font-weight: 500;
          color: #666;
          white-space: nowrap;
        }
        .high-risk-row {
          background-color: rgba(244, 67, 54, 0.05);
        }
        .high-risk-row:hover {
          background-color: rgba(244, 67, 54, 0.1) !important;
        }
        .patient-id {
          font-weight: 500;
          color: #1976d2;
        }
        .gender-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .female {
          background-color: #f8bbd0;
          color: #c2185b;
        }
        .male {
          background-color: #bbdefb;
          color: #1976d2;
        }
        .age-badge {
          background-color: #e8eaf6;
          color: #3949ab;
          border-radius: 12px;
          padding: 4px 8px;
          display: inline-block;
          font-weight: 500;
          text-align: center;
        }
        .sepsis-score-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .sepsis-score {
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
          transition: transform 0.2s;
        }
        .sepsis-score:hover {
          transform: translateY(-2px);
        }
        .sepsis-score.error {
          cursor: help;
        }
        .risk-label {
          font-size: 0.7rem;
          opacity: 0.8;
          margin-top: 3px;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .btn-small {
          padding: 6px 10px;
          font-size: 0.85rem;
        }
        .btn-danger {
          background-color: #f44336;
          color: white;
        }
        .btn-danger:hover {
          background-color: #d32f2f;
        }
        .read-more:hover {
          text-decoration: none;
        }
        .loading-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        .spinner {
          border: 3px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 3px solid #1976d2;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .btn {
          white-space: nowrap;
        }
        .highlight-row {
          animation: highlight 2s;
        }
        @keyframes highlight {
          0% { background-color: rgba(25, 118, 210, 0.2); }
          100% { background-color: transparent; }
        }
      `}</style>
    </div>
  );
}

export default PatientList;
