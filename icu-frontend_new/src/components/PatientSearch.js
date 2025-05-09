import React, { useState } from 'react';
import { fetchPatientOverview } from '../utils/api';

function PatientSearch({ onPatientFound }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError(null);
    
    try {
      const patientId = searchQuery.trim();
      const patientData = await fetchPatientOverview(patientId);
      
      if (!patientData || !patientData.patient) {
        setSearchError(`No patient found with ID: ${patientId}`);
        return;
      }
      
      // Call the callback with the found patient
      onPatientFound(patientData.patient);
      
      // Clear the search input
      setSearchQuery('');
      
    } catch (error) {
      console.error('Error searching for patient:', error);
      setSearchError('Error retrieving patient data. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="patient-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              type="button" 
              className="clear-button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button 
          type="submit" 
          className="search-button"
          disabled={searching || !searchQuery.trim()}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {searchError && (
        <div className="search-error">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{searchError}</span>
        </div>
      )}
      
      <style jsx="true">{`
        .patient-search {
          margin-bottom: 15px;
        }
        
        .search-form {
          display: flex;
          gap: 8px;
        }
        
        .search-input-container {
          position: relative;
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 10px;
          color: #777;
        }
        
        .search-input {
          flex: 1;
          padding: 8px 35px 8px 35px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          width: 100%;
          transition: border-color 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #1976d2;
          box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
        }
        
        .clear-button {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          color: #777;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .clear-button:hover {
          background-color: #f0f0f0;
        }
        
        .search-button {
          padding: 8px 15px;
          background-color: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .search-button:hover:not(:disabled) {
          background-color: #1565c0;
        }
        
        .search-button:disabled {
          background-color: #90caf9;
          cursor: not-allowed;
        }
        
        .search-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding: 8px 12px;
          border-radius: 4px;
          background-color: #ffebee;
          color: #c62828;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default PatientSearch;
