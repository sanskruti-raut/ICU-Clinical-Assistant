import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import PatientDetail from './components/PatientDetail';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="container">
            <h1 className="app-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '12px' }}>
                <path d="M19 3v12h-5c-.023-3.681.184-7.406 5-12zm0 12v6h-1v-3M8 3v12h5c.023-3.681-.184-7.406-5-12zm0 12v6h1v-3"></path>
              </svg>
              ICU Patient Monitoring System
            </h1>
          </div>
        </header>
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patient/:id" element={<PatientDetail />} />
            </Routes>
          </div>
        </main>
        <footer className="footer">
          <div className="container">
            <p>© {new Date().getFullYear()} ICU Patient Monitoring System</p>
          </div>
        </footer>
      </div>
      <style jsx="true">{`
        .app-title {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
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
    </Router>
  );
}

export default App;
