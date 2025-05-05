import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VitalsMonitor from './VitalsMonitor';
import { fetchPatientOverview } from '../utils/api';
import { joinPatientRoom, subscribeToVitals } from '../utils/socket';

function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [icuStay, setIcuStay] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [currentVital, setCurrentVital] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPatientData = async () => {
      setLoading(true);
      try {
        const data = await fetchPatientOverview(id);
        if (data) {
          setPatient(data.patient);
          setIcuStay(data.icuStay);
          setVitalsHistory(data.vitals || []);
        }
      } catch (error) {
        console.error('Error loading patient ' + id + ' data:', error);
      }
      setLoading(false);
    };

    loadPatientData();

    // Join patient-specific room
    joinPatientRoom(id);

    // Subscribe to vital updates via WebSocket
    const unsubscribe = subscribeToVitals((vitalData) => {
      // Convert both to strings for comparison to avoid type mismatches
      if (vitalData && String(vitalData.subject_id) === String(id)) {
        setCurrentVital(vitalData);

        // Add to vitals history
        setVitalsHistory(prev => {
          const updated = [vitalData, ...prev].slice(0, 10); // Keep only the 10 most recent
          return updated;
        });
      }
    });

    return () => {
      unsubscribe(); // Clean up the subscription
    };
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading patient data...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="error-message">
        <p>Patient not found.</p>
        <Link to="/">
          <button className="btn btn-primary">Back to Dashboard</button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Generate avatar placeholder with patient initials
  const getInitials = () => {
    return patient.id.substring(0, 2).toUpperCase();
  };

  return (
    <div className="patient-detail">
      <div className="back-navigation">
        <Link to="/">
          <button className="btn btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="card patient-header">
        <div className="patient-avatar">
          <div className="avatar-placeholder">
            {getInitials()}
          </div>
        </div>
        <div className="patient-basic-info">
          <h2 className="card-title">Patient {patient.id}</h2>
          <div className="patient-tags">
            <span className={`badge ${patient.gender === 'F' ? 'female' : 'male'}`}>
              {patient.gender === 'F' ? '♀ Female' : '♂ Male'}
            </span>
            <span className="badge badge-age">{patient.age} years</span>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="sub-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Patient Information
          </h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Gender</label>
              <span>{patient.gender === 'F' ? 'Female' : 'Male'}</span>
            </div>
            <div className="info-item">
              <label>Age</label>
              <span>{patient.age}</span>
            </div>
            <div className="info-item full-width">
              <label>Conditions</label>
              <div className="conditions-list">
                {patient.diseases && patient.diseases.split(',').map((condition, index) => (
                  <span key={index} className="condition-tag">{condition.trim()}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="sub-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Current ICU Stay
          </h3>
          {icuStay ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Admitted</label>
                <span>{formatDate(icuStay.intime)}</span>
              </div>
              <div className="info-item">
                <label>Discharged</label>
                <span>{formatDate(icuStay.outtime) || 'Still in ICU'}</span>
              </div>
              <div className="info-item">
                <label>Length of Stay</label>
                <span className="stay-duration">{icuStay.los ? (icuStay.los + ' days') : 'Ongoing'}</span>
              </div>
            </div>
          ) : (
            <p className="no-data">No ICU stay information available.</p>
          )}
        </div>
      </div>

      <VitalsMonitor
        currentVital={currentVital}
        vitalsHistory={vitalsHistory}
      />

      <style jsx="true">{`
        .patient-header {
          display: flex;
          align-items: center;
          padding: 24px;
        }
        .patient-avatar {
          margin-right: 20px;
        }
        .avatar-placeholder {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: #1976d2;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 600;
        }
        .patient-basic-info {
          flex: 1;
        }
        .patient-tags {
          display: flex;
          gap: 10px;
          margin-top: 5px;
        }
        .badge.female {
          background-color: #f8bbd0;
          color: #c2185b;
        }
        .badge.male {
          background-color: #bbdefb;
          color: #1976d2;
        }
        .badge-age {
          background-color: #e8eaf6;
          color: #3949ab;
        }
        .sub-title {
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          color: #1976d2;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          display: flex;
          flex-direction: column;
        }
        .info-item label {
          font-size: 0.8rem;
          color: #666;
          margin-bottom: 5px;
        }
        .info-item span {
          font-size: 1rem;
          font-weight: 500;
        }
        .stay-duration {
          color: #1976d2;
          font-weight: 600;
        }
        .full-width {
          grid-column: span 2;
        }
        .conditions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .condition-tag {
          background-color: #f1f8e9;
          color: #689f38;
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.8rem;
          display: inline-block;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border-left-color: #1976d2;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .no-data {
          color: #9e9e9e;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default PatientDetail;
