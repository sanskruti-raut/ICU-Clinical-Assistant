import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PatientProvider } from './context/PatientContext';
import { AlertProvider } from './context/AlertContext';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';

// Import Tailwind CSS
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <PatientProvider>
        <AlertProvider>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="patients" element={<div>Patients Page (Coming Soon)</div>} />
              <Route path="alerts" element={<div>Alerts Page (Coming Soon)</div>} />
              <Route path="reports" element={<div>Reports Page (Coming Soon)</div>} />
              <Route path="settings" element={<div>Settings Page (Coming Soon)</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AlertProvider>
      </PatientProvider>
    </BrowserRouter>
  );
}

export default App;












// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
