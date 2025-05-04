import React from 'react';
import { Link } from 'react-router-dom';

function PatientList({ patients }) {
  return (
    <div className="card">
      <h2 className="card-title">Priority Patients</h2>
      {patients.length === 0 ? (
        <p>No priority patients found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Disease</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.subject_id}>
                <td>{patient.subject_id}</td>
                <td>{patient.anchor_age}</td>
                <td>{patient.gender}</td>
                <td>
                  {patient.disease}
                  {patient.anchor_age > 70 && (
                    <span className="badge badge-warning">Elderly</span>
                  )}
                </td>
                <td>
                  <Link to={`/patient/${patient.subject_id}`}>
                    <button className="btn btn-primary">View</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientList;
