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
            <h1>ICU Patient Monitoring System</h1>
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
      </div>
    </Router>
  );
}

export default App;
