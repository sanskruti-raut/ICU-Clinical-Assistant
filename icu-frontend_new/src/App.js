import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import UserInfo from './components/UserInfo';
import './styles/index.css';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="header-left"></div>
            <h1 className="app-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M19 3v12h-5c-.023-3.681.184-7.406 5-12zm0 12v6h-1v-3M8 3v12h5c.023-3.681-.184-7.406-5-12zm0 12v6h1v-3"></path>
              </svg>
              ICU Patient Monitoring System
            </h1>
            <div className="header-right">
              {user && <UserInfo />}
            </div>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/:id"
              element={
                <PrivateRoute>
                  <PatientDetail />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} ICU Patient Monitoring System</p>
        </div>
      </footer>
      <style jsx="true">{`
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-left,
        .header-right {
          flex: 1;
        }
        .app-title {
          display: flex;
          align-items: center;
          margin: 0;
          flex: 2;
          justify-content: center;
        }
        .header-right {
          display: flex;
          justify-content: flex-end;
        }
        .footer {
          background-color: #1976d2;
          color: rgba(255, 255, 255, 0.7);
          padding: 15px 0;
          text-align: center;
          font-size: 0.8rem;
          margin-top: 40px;
        }
      `}</style>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
