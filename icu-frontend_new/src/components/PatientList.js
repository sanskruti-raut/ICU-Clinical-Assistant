import React from 'react';
import { Link } from 'react-router-dom';

function PatientList({ patients }) {
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
      {patients.length === 0 ? (
        <p>No priority patients found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Primary Conditions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
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
                <td>
                  <Link to={`/patient/${patient.id}`}>
                    <button className="btn btn-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <style jsx="true">{`
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
        }
        .read-more:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}

export default PatientList;
