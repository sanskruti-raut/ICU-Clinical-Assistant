import React from 'react';
import { useAuth } from '../context/AuthContext';

function UserInfo() {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  // Format the role for display
  const formatRole = (role) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get role-specific color
  const getRoleColor = (role) => {
    switch (role) {
      case 'doctor':
        return '#4caf50'; // Green
      case 'nurse':
        return '#2196f3'; // Blue
      case 'admin':
        return '#f44336'; // Red
      default:
        return '#9e9e9e'; // Grey
    }
  };

  // Extract first letter of email for avatar
  const getInitial = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="user-info">
      <div className="user-details">
        <div 
          className="user-avatar"
          style={{ backgroundColor: getRoleColor(user.role) }}
        >
          {getInitial(user.email)}
        </div>
        <div className="user-text">
          <div className="user-name">{user.email}</div>
          <div className="user-role" style={{ color: getRoleColor(user.role) }}>
            {formatRole(user.role)}
          </div>
        </div>
      </div>
      
      <button onClick={logout} className="logout-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Logout
      </button>
      
      <style jsx="true">{`
        .user-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        
        .user-details {
          display: flex;
          align-items: center;
        }
        
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
          margin-right: 10px;
        }
        
        .user-text {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-weight: 500;
          color: #333;
        }
        
        .user-role {
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .logout-button {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          font-size: 0.9rem;
          padding: 5px 10px;
          border-radius: 4px;
          transition: background-color 0.2s, color 0.2s;
        }
        
        .logout-button:hover {
          background-color: rgba(0, 0, 0, 0.05);
          color: #333;
        }
      `}</style>
    </div>
  );
}

export default UserInfo;
