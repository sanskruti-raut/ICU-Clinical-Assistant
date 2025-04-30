# ICU Clinical Assistant
EE_547 Final Project

A comprehensive ICU patient monitoring dashboard system with real-time alerts, patient overview, and analytics.

## Project Structure

The project consists of two main parts:

1. **Backend (icu-backend)**: Express.js server that provides API endpoints
2. **Frontend (icu-frontend)**: React application for the user interface

## Features

- **ICU Patient Overview Grid**: View all active ICU patients with key summary information
- **Real-Time Alerts Feed**: Scrollable feed showing critical alerts like "HR critical" or "Sepsis risk > 80%"
- **ICU Analytics Summary**: Dashboard-style metrics with statistics
- **Priority Patient List**: Sorted by highest risk, flags patients with unacknowledged alerts

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup and Installation

#### Backend

1. Navigate to the backend directory:
   ```
   cd icu-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   npm start
   ```
   
   The server will run on port 3001 by default.

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd icu-frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```
   
   The application will open in your browser at http://localhost:3000

## API Endpoints

- `GET /api/patients/overview` - Get all active ICU patients
- `GET /api/alerts/recent` - Get recent alerts
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/priority/list` - Get prioritized patients

## Technologies Used

### Backend
- Express.js
- Node.js
- CORS for cross-origin requests

### Frontend
- React
- React Router for navigation
- Axios for API requests
- Recharts for data visualization
- Tailwind CSS for styling

## Future Enhancements

- Patient detail view with comprehensive medical history
- Real-time updates using WebSockets
- Advanced filtering and searching capabilities
- Customizable dashboard layouts
- User authentication and role-based access control
- Mobile responsive design for tablet use at bedside
