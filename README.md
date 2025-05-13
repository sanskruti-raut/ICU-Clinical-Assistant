# ICU Patient Monitoring System

A real-time patient monitoring system designed for Intensive Care Units (ICUs) that tracks patient vitals, provides sepsis risk predictions, and alerts healthcare providers to critical conditions.

## Features

- **Real-time Vital Monitoring**: Live tracking of patient vitals including heart rate, blood pressure, temperature, and respiratory rate
- **Sepsis Risk Assessment**: Machine learning-based sepsis risk scoring using logistic regression
- **Alert System**: Real-time alerts for abnormal vital signs and high sepsis risk patients
- **Patient Management**: Comprehensive patient information management with disease tracking
- **User Authentication**: Role-based access control for doctors, nurses, and administrators
- **Analytics Dashboard**: ICU statistics and metrics visualization
- **AWS SNS Integration**: Automated notifications for critical alerts via AWS Simple Notification Service

## Technology Stack

### Backend
- Node.js with Express.js
- PostgreSQL database
- Socket.io for real-time communication
- JWT authentication
- AWS SDK for SNS notifications
- bcrypt for password hashing

### Frontend
- React 18
- React Router v6 for navigation
- Chart.js for data visualization
- Socket.io-client for real-time updates
- Axios for API communication
- Material-UI components

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- AWS account (for SNS notifications)
- npm or yarn package manager

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd icu-monitor-system
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd icu-backend_PAYAL
```

Install dependencies:
```bash
npm install
```

Create a `.env` file with the following configuration:
```env
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
DB_PORT=5432
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
PORT=3000
```

Set up AWS credentials for SNS (optional):
```bash
# Configure AWS CLI or set environment variables
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-1
```

Initialize the database:
```bash
# Create tables and seed data
psql -U your-database-user -d your-database-name < init_users_table.sql
psql -U your-database-user -d your-database-name < add_test_user.sql
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd ../icu-frontend_new
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

The application will be available at http://54.241.44.20:3000/

## Default Login Credentials

The system comes with pre-configured test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@vitalwatch.com | password123 | Admin |
| doctor@vitalwatch.com | password123 | Doctor |
| nurse@vitalwatch.com | password123 | Nurse |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Patient Management
- `GET /api/priority-patients` - Get top 5 priority patients
- `GET /api/patient-overview/:id` - Get detailed patient information
- `POST /api/add-patient` - Add new patient
- `DELETE /api/delete-patient/:id` - Delete patient

### Vitals
- `GET /api/vitals/stream` - Get global vitals stream
- `GET /api/vitals/stream/:subject_id` - Get patient-specific vitals

### Alerts
- `GET /api/alerts` - Get active heart rate alerts
- `GET /api/sepsis-alerts` - Get sepsis risk alerts

### Analytics
- `GET /api/analytics-summary` - Get ICU statistics
- `GET /api/score/:id` - Get patient sepsis risk score
- `GET /api/dashboard` - Get dashboard data

## Real-time Communication

The system uses Socket.io for real-time updates:

### Socket Events
- `join-patient-room` - Join patient-specific room for updates
- `vital-update` - Receive vital sign updates
- `alert` - Receive critical alerts

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Priority Patients Table
```sql
CREATE TABLE priority_patients (
  id INTEGER PRIMARY KEY,
  age INTEGER,
  gender CHAR(1),
  diseases TEXT,
  risk_score FLOAT
);
```

### Vitals Table
```sql
CREATE TABLE vitals (
  subject_id INTEGER,
  charttime TIMESTAMP,
  label VARCHAR(255),
  valuenum FLOAT
);
```

## Key Components

### Backend
- `simulator.js` - Simulates vital signs and checks for alerts
- `routes/score.js` - Implements logistic regression for sepsis risk scoring
- `routes/auth.js` - Handles authentication and JWT tokens
- `db.js` - PostgreSQL connection configuration

### Frontend
- `Dashboard.js` - Main dashboard with patient list and alerts
- `PatientDetail.js` - Individual patient view with real-time vitals
- `VitalsMonitor.js` - Real-time vital signs chart and monitoring
- `AlertsPanel.js` - Heart rate alerts display
- `SepsisAlerts.js` - Sepsis risk alerts display

## Alert System

The system monitors for:
- High heart rate (>90 bpm) - triggers SNS notification
- High blood pressure (systolic >50 mmHg)
- Sepsis risk based on logistic regression model

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Secure API endpoints with authentication middleware

## Development

### Backend Development
```bash
cd icu-backend_PAYAL
npm start
```

### Frontend Development
```bash
cd icu-frontend_new
npm start
```

### Testing
To test authentication:
```bash
node test_auth.js
```

To create password hashes:
```bash
node create_test_hash.js
```

## Production Deployment

### Build Frontend
```bash
cd icu-frontend_new
npm run build
```

The build will be served by the Express backend from the `/build` directory.

### Environment Variables
Ensure all environment variables are properly configured for production:
- Database credentials
- JWT secret key
- AWS credentials for SNS



## Acknowledgments

- Thanks to all contributors
- Inspired by real ICU monitoring needs
