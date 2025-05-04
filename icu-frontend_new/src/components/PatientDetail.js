import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VitalsMonitor from './VitalsMonitor';
import { fetchPatientOverview, fetchVitals } from '../utils/api';

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
          setVitalsHistory(data.vitals);
        }
      } catch (error) {
        console.error(`Error loading patient ${id} data:`, error);
      }
      setLoading(false);
    };

    loadPatientData();

    // Set up polling for real-time vitals
    const vitalsInterval = setInterval(async () => {
      const vitalData = await fetchVitals(id);
      if (vitalData) {
        setCurrentVital(vitalData);
      }
    }, 1000);

    return () => clearInterval(vitalsInterval);
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
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

  return (
    <div className="patient-detail">
      <div className="back-navigation">
        <Link to="/">
          <button className="btn btn-secondary">Back to Dashboard</button>
        </Link>
      </div>

      <div className="card">
        <h2 className="card-title">
          Patient {patient.subject_id} 
          {patient.disease && (
            <span className="badge badge-primary">{patient.disease}</span>
          )}
        </h2>

        <div className="grid grid-2">
          <div>
            <h3>Patient Information</h3>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Age:</strong> {patient.anchor_age}</p>
            <p><strong>Disease:</strong> {patient.disease || 'Not specified'}</p>
          </div>
          <div>
            <h3>Current ICU Stay</h3>
            {icuStay ? (
              <>
                <p><strong>Admitted:</strong> {formatDate(icuStay.intime)}</p>
                <p><strong>Discharged:</strong> {formatDate(icuStay.outtime) || 'Still in ICU'}</p>
                <p><strong>Length of Stay:</strong> {icuStay.los ? `${icuStay.los} days` : 'Ongoing'}</p>
              </>
            ) : (
              <p>No ICU stay information available.</p>
            )}
          </div>
        </div>
      </div>

      <VitalsMonitor 
        currentVital={currentVital}
        vitalsHistory={vitalsHistory}
      />
    </div>
  );
}

export default PatientDetail;
