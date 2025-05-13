# ICU Patient Monitoring System

## Team Members
Sanskruti Raut, Niveditha Madegowda, Payal Chatterjee

## Project Overview
A real-time ICU monitoring system that tracks patient vitals, predicts sepsis risk using machine learning, and sends critical alerts via AWS SNS.


### Prerequisites
- Node.js 14+
- PostgreSQL
- AWS Account (for SNS alerts)

### Setup
1. **Clone repository**
   ```bash
   git clone <repo-url>
   ```

2. **Backend setup**
   ```bash
   cd icu-backend_PAYAL
   npm install
   
   # Create .env file with:
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_NAME=icu_monitor
   JWT_SECRET=your-secret
   PORT=3000
   
   # Initialize database
   psql -U postgres -d icu_monitor < init_users_table.sql
   
   node index.js
   ```

3. **Frontend setup**
   ```bash
   cd ../icu-frontend_new
   npm install
   npm run build
   ```

### Test Credentials
- **Admin**: admin@vitalwatch.com / password123
- **Doctor**: doctor@vitalwatch.com / password123
- **Nurse**: nurse@vitalwatch.com / password123

## Key Features
- Real-time vital signs monitoring
- Sepsis risk prediction (logistic regression)
- AWS SNS alerts for critical conditions
- Role-based authentication (JWT)
- Patient management dashboard

## Architecture
```
Frontend (React)
    ↓
Backend (Express.js)
    ↓
Database (PostgreSQL)
    ↓
Real-time (Socket.io)
    ↓
Alerts (AWS SNS)
```

## Main Components
- **Backend**: Express API with real-time simulation
- **Frontend**: React dashboard with Chart.js
- **Database**: PostgreSQL with patient/vitals data
- **ML Model**: Logistic regression for sepsis scoring

## API Endpoints
- `/api/auth/*` - Authentication
- `/api/priority-patients` - Patient list
- `/api/score/:id` - Sepsis risk score
- `/api/alerts` - Real-time alerts
- `/api/vitals/stream/:id` - Patient vitals

## Technologies Used
- **Backend**: Node.js, Express, Socket.io, JWT
- **Frontend**: React 18, Chart.js, Axios
- **Database**: PostgreSQL
- **Cloud**: AWS SNS
- **ML**: Logistic Regression

## Demo Instructions
1. Login with test credentials
2. View patient dashboard
3. Click on patient for real-time vitals
4. Monitor alerts panel
5. Check sepsis risk scores

## Known Issues
- Database connection may timeout under heavy load
- Sepsis scores may show "N/A" if features missing
- Real-time updates require active socket connection


## References
- [MIMIC-III Database](https://mimic.physionet.org/)
